export const getColumns = (
  hasPaidOrders: boolean,
  hasClaimedOrders: boolean,
  hasLogisticItems: boolean,
  hasClassInfos: boolean
): { id: string; label: string }[] => {
  return [
    {
      id: 'index',
      label: '',
    },
    {
      id: 'nickname',
      label: '微信昵称',
    },
    {
      id: 'child_name',
      label: '学生姓名',
    },
    ...(hasPaidOrders
      ? [
          {
            id: 'work_name',
            label: '项目链接名称',
          },
          {
            id: 'paid',
            label: '已购买',
          },
        ]
      : []),
    ...(hasClaimedOrders
      ? [
          {
            id: 'claimed',
            label: '已领单',
          },
          { id: 'flagid_name', label: '领单人' },
        ]
      : []),
    {
      id: 'age',
      label: '年龄',
    },
    {
      id: 'phone_number_formatted',
      label: '格式化电话',
    },
    ...(hasLogisticItems
      ? [
          {
            id: 'goods_desc',
            label: '三方物料信息',
          },
          {
            id: 'shipping_goods_desc',
            label: '内部物料信息',
          },
          {
            id: 'create_time',
            label: '创建时间',
          },
          {
            id: 'create_by_name',
            label: '创建人',
          },
          {
            id: 'audit_state_value',
            label: '审核状态',
          },
          {
            id: 'waybill_state_value',
            label: '发货状态',
          },
          {
            id: 'delivery_time',
            label: '发货时间',
          },
          {
            id: 'delivery_address',
            label: '实际发货地址',
          },
          {
            id: 'should_delivery_address',
            label: '应发货地址',
          },
          {
            id: 'address_correct_status',
            label: '发货地址是否匹配',
          },
          {
            id: 'logistics_type',
            label: '物流方式',
          },
          {
            id: 'delivery_waybill_no',
            label: '物流号',
          },
          {
            id: 'logistics_state',
            label: '物流状态',
          },
        ]
      : []),
    {
      id: 'contact_name',
      label: '联系姓名',
    },
    {
      id: 'user_id',
      label: '用户ID',
    },
    {
      id: 'phone_number',
      label: '用户电话',
    },
    {
      id: 'province',
      label: '省',
    },
    {
      id: 'city',
      label: '市',
    },
    {
      id: 'district',
      label: '区',
    },
    {
      id: 'address',
      label: '详细地址',
    },
    ...(hasClassInfos
      ? [
          {
            id: 'package_name',
            label: '前课程',
          },
          {
            id: 'teacher_name',
            label: '前班主任',
          },
          {
            id: 'teacher_nickname',
            label: '前班主任昵称',
          },
        ]
      : []),
  ];
};

export const getColumnMinWidth = (colId: string): string => {
  switch (colId) {
    case 'index':
      return '0';

    case 'age':
      return '40px';

    case 'child_name':
    case 'province':
    case 'city':
    case 'district':
      return '60px';

    case 'nickname':
    case 'contact_name':
    case 'user_id':
      return '80px';

    case 'phone_number':
    case 'phone_number_formatted':
      return '140px';

    default:
      return '120px';
  }
};
