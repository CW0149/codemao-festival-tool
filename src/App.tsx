import React, { useMemo, useState } from "react";
import "./App.css";
import QueryForm from "./components/QueryForm";
import Results from "./components/Results";
import { FormData, Order, OrderData, ValidOrderData } from "./constants/types";
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

  const queryOrderHandler = async (formData: FormData) => {
    setQueryDisabled(true);

    const hasAccess = await testHasAccess(formData.token, formData.ids[0]);

    if (hasAccess) {
      setOrdersData([]);

      const ordersData = await getOrdersData(
        formData.token,
        linesStrToArr(formData.ids),
        formData.workName,
        formData.ownerName
      );
      setOrdersData(ordersData);
    }

    setQueryDisabled(false);
  };

  const claimOrderHandler = async (formData: FormData) => {
    if (!ordersData.length) {
      alert("请先查询");
    }

    if (notClaimedOrders.length) {
      await claimOrders(
        formData.token,
        notClaimedOrders,
        formData.classInfo,
        formData.ownerName,
        formData.ownerEmail
      );
      await queryOrderHandler(formData);
      alert("已重新获取数据，也可以去系统查看验证");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="tip">
          <p>
            若要<em>查询</em>，请确保用户ID、项目链接名称、归属人准确
          </p>
          <p>
            若要<em>自动领单</em>，请确保用户ID、项目链接名称准确，
            <br />
            <strong>归属人、归属班期会决定归属人和所属班期</strong>
            <br />
            归属人邮箱非必填，<strong>若公司存在归属人同名则必填</strong>
          </p>
        </div>
      </header>
      <QueryForm
        onQueryOrder={queryOrderHandler}
        onClaimOrder={claimOrderHandler}
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
