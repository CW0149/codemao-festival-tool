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
import { Box, Button, Divider, Grid } from "@mui/material";
import { getColumns } from "./constants/columns";

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
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item md={10} xs={12}>
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
        </Grid>
        <Grid item md={2} xs={0}>
          <Box sx={{ p: 1, background: "#fff" }}>
            <CsvDownloader
              filename={`${formData.classInfo}`}
              datas={rows}
              columns={getColumns(
                !!paidOrders.length,
                !!claimedOrders.length,
                !!logisticItems.length,
                !!classInfos.length
              ).map((item) => ({ id: item.id, displayName: item.label }))}
            >
              <Button
                variant="contained"
                size="small"
                onClick={exportTable}
                sx={{ width: "100%" }}
              >
                导出表格
              </Button>
            </CsvDownloader>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ margin: "10px 0" }} />

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
