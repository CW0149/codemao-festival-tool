import { useEffect, useMemo, useState } from "react";
import "./App.css";
import QueryForm from "./components/QueryForm";
import Summary from "./components/Summary";
import StuTable from "./components/StuTable";
import {
  ClassData,
  FormData,
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
  getOrdersData,
  getOwnerByEmail,
  getStudentsByClass,
  testHasAccess,
} from "./helpers/requests";
import { formData as MockedFormData } from "./mocks/formData";
function App() {
  const [ordersData, setOrdersData] = useState([] as OrderData[]);
  const [queryDisabled, setQueryDisabled] = useState(true);

  const [formData, setFormData] = useState<FormData>(MockedFormData);
  const [ownerData, setOwnerData] = useState<OwnerData>();
  const [ownerClassesData, setOwnerClassesData] = useState<ClassData[]>();
  const [classStudents, setClassStudents] = useState<Student[]>([]);

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

  useEffect(() => {
    try {
      if (!formData.token) throw Error("请设置token");

      getOwnerByEmail(formData.token, formData.ownerEmail).then((owner) => {
        setOwnerData(owner);
        getClassesData(formData.token as string, owner.id).then(
          (classesData) => {
            setOwnerClassesData(classesData);
            setQueryDisabled(false);
            setOrdersData([]);
          }
        );
      });
    } catch (err) {
      setQueryDisabled(true);
      alert(err);
    }
  }, [formData.ownerEmail, formData.token, setQueryDisabled]);

  useEffect(() => {
    try {
      setQueryDisabled(true);
      if (!ownerClassesData?.length) return;

      const classData = filterOutClassData(
        formData.classInfo,
        ownerClassesData
      );
      if (!classData) {
        return;
      }

      getStudentsByClass(classData.class_id, classData.term_id)
        .then((classStudents) => {
          setClassStudents(classStudents);

          if (!classStudents.length) {
            throw Error("未获取到学生列表，请重试或刷新页面");
          }

          setQueryDisabled(false);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      alert(err);
    }
  }, [formData.classInfo, ownerClassesData, setQueryDisabled]);

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

  return (
    <div className="App">
      <header className="App-header"></header>
      <QueryForm
        onQueryOrders={queryOrdersHandler}
        onClaimOrders={claimOrdersHandler}
        queryDisabled={queryDisabled}
        claimDisabled={claimDisabled}
        formData={formData}
        setFormData={setFormData}
        ownerClassesData={ownerClassesData}
      />
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
          data={classStudents}
          paidOrderUserIds={paidOrderUserIds}
          claimedOrderUserIds={claimedOrderUserIds}
        />
      </div>
    </div>
  );
}

export default App;
