export const getColumns = (
  hasPaidOrders: boolean,
  hasClaimedOrders: boolean,
  hasLogisticItems: boolean,
  hasClassInfos: boolean
): { id: string; label: string }[] => {
  return [
    {
      id: "index",
      label: "",
    },
    {
      id: "nickname",
      label: "微信昵称",
    },
    {
      id: "child_name",
      label: "学生姓名",
    },
    ...(hasPaidOrders
      ? [
          {
            id: "paid",
            label: "已购买",
          },
        ]
      : []),
    ...(hasClaimedOrders
      ? [
          {
            id: "claimed",
            label: "我已领单",
          },
        ]
      : []),
    {
      id: "age",
      label: "年龄",
    },
    ...(hasLogisticItems
      ? [
          {
            id: "goodsDesc",
            label: "三方物料信息",
          },
          {
            id: "logisticsState",
            label: "物流状态",
          },
          {
            id: "deliveryWaybillNo",
            label: "物流号",
          },
        ]
      : []),
    {
      id: "consignee_name",
      label: "收件人姓名",
    },
    {
      id: "user_id",
      label: "用户ID",
    },
    {
      id: "phone_number",
      label: "用户电话",
    },
    {
      id: "province",
      label: "省",
    },
    {
      id: "city",
      label: "市",
    },
    {
      id: "district",
      label: "区",
    },
    {
      id: "address",
      label: "详细地址",
    },
    ...(hasClassInfos
      ? [
          {
            id: "package_name",
            label: "前课程",
          },
          {
            id: "teacher_name",
            label: "前班主任",
          },
          {
            id: "teacher_nickname",
            label: "前班主任昵称",
          },
        ]
      : []),
  ];
};
