import React, { useMemo, useState } from "react";
import "./App.css";
import QueryForm from "./components/QueryForm";
import Results from "./components/Results";
import {
  FormData,
  Order,
  OrderData,
  OwnerData,
  Student,
  ValidOrderData,
} from "./constants/types";
import { claimOrders, getOrdersData, testHasAccess } from "./helpers/requests";

function App() {
  const [ordersData, setOrdersData] = useState([] as OrderData[]);
  const [queryDisabled, setQueryDisabled] = useState(true);

  const paidOrdersData = useMemo(
    () => ordersData.filter((data) => !!data) as ValidOrderData[],
    [ordersData]
  );

  const paidOrders: Order[] = useMemo(
    () => paidOrdersData.map((data) => data.order),
    [paidOrdersData]
  );

  const claimedOrders: Order[] = useMemo(
    () =>
      paidOrdersData.filter((data) => data.claimed).map((data) => data.order),
    [paidOrdersData]
  );

  const notClaimedOrders: Order[] = useMemo(() => {
    const orders = [];
    const claimedIds = claimedOrders.map((order) => order.user_id);
    const claimedIdSet = new Set(claimedIds);

    for (let paid of paidOrders) {
      if (!claimedIdSet.has(paid.user_id)) {
        orders.push(paid);
      }
    }
    return orders;
  }, [claimedOrders, paidOrders]);

  const claimDisabled = useMemo(
    () => !notClaimedOrders.length,
    [notClaimedOrders]
  );

  const queryOrdersHandler = async (
    formData: FormData,
    ownerData: OwnerData,
    classStudents: Student[]
  ) => {
    if (!formData.token) {
      console.log("请设置token");
      return;
    }

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

  const claimOrdersHandler = async (
    formData: FormData,
    ownerData: OwnerData,
    classStudents: Student[]
  ) => {
    if (!formData.token) {
      console.log("请设置token");
      return;
    }

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
      await queryOrdersHandler(formData, ownerData, classStudents);
      alert("已重新获取数据，也可以去系统查看验证");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="tip">
          <p>
            <strong>
              输入下单链接、归属人邮箱查询已下单和已认领 ｜
              下单链接名称支持模糊匹配 ｜ 先查询再领单
            </strong>
          </p>
        </div>
      </header>
      <QueryForm
        onQueryOrders={queryOrdersHandler}
        onClaimOrders={claimOrdersHandler}
        queryDisabled={queryDisabled}
        claimDisabled={claimDisabled}
        setQueryDisabled={setQueryDisabled}
      />
      <Results
        ordersData={ordersData}
        notClaimedOrders={notClaimedOrders}
        claimedOrders={claimedOrders}
        paidOrders={paidOrders}
      />
    </div>
  );
}

export default App;
