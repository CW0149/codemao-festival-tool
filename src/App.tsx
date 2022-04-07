import { FC, useEffect, useMemo, useState } from "react";
import CsvDownloader from "react-csv-downloader";
import "./App.css";
import QueryForm from "./components/QueryForm";
import Summary from "./components/Summary";
import StuTable, { StudentTableRow } from "./components/StuTable";
import {
  ClassData,
  ClassInfo,
  FormData,
  LogisticItem,
  Order,
  OrderData,
  OwnerData,
  Student,
  ValidOrderData,
} from "./constants/types";
import {
  claimOrders,
  filterOutClassData,
  getClassesData,
  getMatchedClassInfosByPackageNames,
  getMatchedLogicsByPhones,
  getOrdersData,
  getOwnerByEmail,
  getStudentsByClass,
  testHasAccess,
} from "./helpers/requests";
import { formData as MockedFormData } from "./mocks/formData";
import { Button } from "@mui/material";

const App: FC = () => {
  const [ordersData, setOrdersData] = useState([] as OrderData[]);
  const [queryDisabled, setQueryDisabled] = useState(true);
  const [getLogisticDisabled, setGetLogisticDisabled] = useState(true);
  const [getPreviousClassInfoDisabled, setGetPreviousClassInfoDisabled] =
    useState(true);

  const [formData, setFormData] = useState<FormData>(MockedFormData);
  const [ownerData, setOwnerData] = useState<OwnerData>();
  const [ownerClassesData, setOwnerClassesData] = useState<ClassData[]>();
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [logisticItems, setLogisticItems] = useState<
    (LogisticItem | undefined)[]
  >([]);
  const [classInfos, setClassInfos] = useState<(ClassInfo | undefined)[]>([]);

  const paidOrdersData = useMemo(
    () => ordersData.filter((data) => !!data) as ValidOrderData[],
    [ordersData]
  );
  const paidOrders: Order[] = useMemo(
    () => paidOrdersData.map((data) => data.order),
    [paidOrdersData]
  );
  const paidOrderUserIds = useMemo(
    () => paidOrders.map((order) => order.user_id),
    [paidOrders]
  );

  const claimedOrders: Order[] = useMemo(
    () =>
      paidOrdersData.filter((data) => data.claimed).map((data) => data.order),
    [paidOrdersData]
  );
  const claimedOrderUserIds = useMemo(
    () => claimedOrders.map((order) => order.user_id),
    [claimedOrders]
  );
  const notClaimedOrders: Order[] = useMemo(() => {
    const orders = [];
    const claimedIdSet = new Set(claimedOrderUserIds);

    for (let paid of paidOrders) {
      if (!claimedIdSet.has(paid.user_id)) {
        orders.push(paid);
      }
    }
    return orders;
  }, [claimedOrderUserIds, paidOrders]);

  const claimDisabled = useMemo(
    () => !notClaimedOrders.length,
    [notClaimedOrders]
  );

  const [rows, setRows] = useState<StudentTableRow[]>([]);

  useEffect(() => {
    if (classStudents && classStudents.length) {
      setRows(classStudents);
    }
  }, [classStudents]);

  useEffect(() => {
    getClassesDataByEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.ownerEmail]);

  useEffect(() => {
    if (!classStudents?.length) {
      getStudentsByClassInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerClassesData]);

  useEffect(() => {
    getStudentsByClassInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.classInfo]);

  const getClassesDataByEmail = async () => {
    try {
      if (!formData.token) throw Error("请设置token");

      getOwnerByEmail(formData.token, formData.ownerEmail).then((owner) => {
        setOwnerData(owner);
        getClassesData(formData.token as string, owner.id).then(
          (classesData) => {
            setOwnerClassesData(classesData);
            setQueryDisabled(false);
          }
        );
      });
    } catch (err) {
      setQueryDisabled(true);
      alert(err);
    }
  };

  const getStudentsByClassInfo = () => {
    if (!ownerClassesData?.length) return;

    const classData = filterOutClassData(formData.classInfo, ownerClassesData);
    if (!classData) return;

    setQueryDisabled(true);
    setGetLogisticDisabled(true);
    setGetPreviousClassInfoDisabled(true);
    setClassStudents([]);
    setOrdersData([]);
    setLogisticItems([]);
    setClassInfos([]);

    getStudentsByClass(classData.class_id, classData.term_id).then(
      (classStudents = []) => {
        setClassStudents(classStudents);
        setQueryDisabled(false);
        setGetLogisticDisabled(false);
        setGetPreviousClassInfoDisabled(false);

        if (!classStudents?.length) {
          alert("未获取到学生列表，请重试或刷新页面");
        }
      }
    );
  };

  const queryOrdersHandler = async (formData: FormData) => {
    if (!formData.token) {
      console.log("请设置token");
      return;
    }
    if (!classStudents.length || !ownerData) return;

    setQueryDisabled(true);

    const ids = classStudents.map((stu) => stu.user_id);
    const hasAccess = await testHasAccess(formData.token, ids[0]);

    if (hasAccess) {
      setOrdersData([]);

      const ordersData = await getOrdersData(
        formData.token,
        ids,
        formData.workName,
        ownerData.name
      );
      setOrdersData(ordersData);
    } else {
      alert("登录已过期");
    }

    setQueryDisabled(false);
  };

  const claimOrdersHandler = async (formData: FormData) => {
    if (!formData.token) {
      console.log("请设置token");
      return;
    }
    if (!ownerData) return;

    if (!ordersData.length) {
      alert("请先查询");
    }

    if (notClaimedOrders.length) {
      await claimOrders(
        formData.token,
        notClaimedOrders,
        formData.classInfo,
        ownerData
      );
      await queryOrdersHandler(formData);
      alert("已重新获取数据，也可以去系统查看验证");
    }
  };

  const exportTable = () => {};

  return (
    <div className="App">
      <header>
        <QueryForm
          onQueryOrders={queryOrdersHandler}
          onClaimOrders={claimOrdersHandler}
          queryDisabled={queryDisabled}
          claimDisabled={claimDisabled}
          formData={formData}
          setFormData={setFormData}
          ownerClassesData={ownerClassesData}
          getLogisticDisabled={getLogisticDisabled}
          getPreviousClassInfoDisabled={getPreviousClassInfoDisabled}
          onQueryLogistics={async () => {
            setGetLogisticDisabled(true);

            const items = await getMatchedLogicsByPhones(
              classStudents.map((stu) => stu.phone_number),
              formData.shippingGoodsDesc
            );
            setLogisticItems(items);
            setGetLogisticDisabled(false);
          }}
          onQueryPreviousClassInfo={async () => {
            setGetPreviousClassInfoDisabled(true);

            const items = await getMatchedClassInfosByPackageNames(
              classStudents.map((stu) => stu.user_id),
              formData.packageName
            );
            setClassInfos(items);
            setGetPreviousClassInfoDisabled(false);
          }}
        />
        <div className="pc_btns">
          <CsvDownloader
            filename={`${formData.classInfo}`}
            datas={rows}
            columns={[
              {
                id: "nickname",
                displayName: "昵称",
              },
              {
                id: "child_name",
                displayName: "学生",
              },
              ...(paidOrderUserIds.length
                ? [
                    {
                      id: "paid",
                      displayName: "已购买",
                    },
                  ]
                : []),
              ...(claimedOrderUserIds.length > 0
                ? [
                    {
                      id: "claimed",
                      displayName: "我已领单",
                    },
                  ]
                : []),
              {
                id: "age",
                displayName: "年龄",
              },
              {
                id: "user_id",
                displayName: "用户ID",
              },
              ...(logisticItems.length
                ? [
                    {
                      id: "goodsDesc",
                      displayName: "三方物料信息",
                    },
                    {
                      id: "logisticsState",
                      displayName: "物流状态",
                    },
                    {
                      id: "deliveryWaybillNo",
                      displayName: "物流号",
                    },
                    {
                      id: "consigneeName",
                      displayName: "收货人信息",
                    },
                  ]
                : []),
              {
                id: "phone_number",
                displayName: "电话",
              },
              ...(classInfos.length
                ? [
                    {
                      id: "package_name",
                      displayName: "前课程",
                    },
                    {
                      id: "teacher_name",
                      displayName: "前班主任",
                    },
                    {
                      id: "teacher_nickname",
                      displayName: "前班主任昵称",
                    },
                  ]
                : []),
            ]}
          >
            <Button variant="contained" onClick={exportTable}>
              导出表格
            </Button>
          </CsvDownloader>
        </div>
      </header>
      <hr />

      <div className="results">
        <Summary
          ordersData={ordersData}
          notClaimedOrders={notClaimedOrders}
          claimedOrders={claimedOrders}
          paidOrders={paidOrders}
          classInfo={formData.classInfo}
          classStudents={classStudents}
        />
        <StuTable
          data={rows}
          paidOrderUserIds={paidOrderUserIds}
          claimedOrderUserIds={claimedOrderUserIds}
          logisticItems={logisticItems}
          classInfos={classInfos}
          setRows={setRows}
        />
      </div>
    </div>
  );
};

export default App;
