import React, { useMemo, useState } from "react";
import "./App.css";
import QueryForm from "./components/QueryForm";
import Results from "./components/Results";
import {
  FormData,
  Order,
  OrderData,
  OwnerData,
  ValidOrderData,
} from "./constants/types";
import { linesStrToArr } from "./helpers";
import { claimOrders, getOrdersData, testHasAccess } from "./helpers/requests";

function App() {
  const [ordersData, setOrdersData] = useState([] as OrderData[]);
  const [queryDisabled, setQueryDisabled] = useState(false);

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
    ownerData: OwnerData
  ) => {
    setQueryDisabled(true);

    const hasAccess = await testHasAccess(formData.token, formData.ids[0]);

    if (hasAccess) {
      setOrdersData([]);

      const ordersData = await getOrdersData(
        formData.token,
        linesStrToArr(formData.ids),
        formData.workName,
        ownerData.name
      );
      setOrdersData(ordersData);
    }

    setQueryDisabled(false);
  };

  const claimOrdersHandler = async (
    formData: FormData,
    ownerData: OwnerData
  ) => {
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
      await queryOrdersHandler(formData, ownerData);
      alert("已重新获取数据，也可以去系统查看验证");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="tip">
          <p>
            <strong>
              1. 输入用户ID、下单链接、归属人邮箱查询 &nbsp;&nbsp;2.
              下单链接名称支持模糊匹配&nbsp;&nbsp;3. 先查询再领单
            </strong>
          </p>
        </div>
      </header>
      <QueryForm
        onQueryOrders={queryOrdersHandler}
        onClaimOrders={claimOrdersHandler}
        queryDisabled={queryDisabled}
        claimDisabled={claimDisabled}
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
