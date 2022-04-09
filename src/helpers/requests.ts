import dayjs from 'dayjs';
import {
  postFestivalData,
  getFestivalData,
  postCrmData,
  classDataToClassInfo,
  getCrmData,
  formatPhone,
} from '.';
import {
  ClassData,
  ClassInfo,
  LogisticItem,
  LogisticItemBE,
  Order,
  OrderData,
  OwnerData,
  Student,
  StudentBE,
} from '../constants/types';

/**
 *
 * workName: string, // 项目链接名称
 * ownerName: string // 归属人
 */

const queryOrder = (token: string, userId: string) => {
  return postFestivalData(
    token,
    'https://festival.codemao.cn/yyb2019/index/checkAddOrder',
    {
      flag: '4',
      work_name: '',
      tit: '',
      times: [],
      begin: '',
      end: '',
      totimes: [],
      tobegin: '',
      toend: '',
      toflag: 'all',
      username: '',
      tel: '',
      type: 2,
      paytit: '',
      user_id: userId,
      login_name: '',
      term_name: '',
      teacher_name: '',
      page: 1,
      out_trade_no: '',
      classinfo: '',
      businessType: 'all',
      isflag: '',
      teacher_email_1000: '',
      teacher_email_16: '',
      teacher_email_ti: '',
      teacher_email_nian: '',
      nickname: '',
      claim_status: 'all',
      tianmaocode: '',
      payment_method: 'all',
      hand_name: '',
      limit: 10,
    }
  );
};

const getOrderDataByUser = async (
  token: string,
  userId: string,
  workName: string,
  ownerName: string
): Promise<OrderData> => {
  if (!token || !userId) return null;

  const res = await queryOrder(token, userId);
  if (res.res === 'error') {
    throw res.code;
  }
  if (res.count === 0) return null;

  const info = res.info ?? [];

  for (let i = 0; i < info.length; i += 1) {
    if (info[i].work_name && info[i].work_name.includes(workName)) {
      const data: OrderData = { order: info[i], paid: true };
      if (info[i].flagid_name === ownerName) {
        data.claimed = true;
      }
      return data;
    }
  }
  return null;
};

const claimOrder = (
  token: string,
  order: Order,
  flagid: number,
  classData: ClassData,
  classInfo: string
) => {
  const sendExtra = {
    nochange: true,
    user_id_none: true,
    business_type_none: true,
    urltype_none: true,
    tuan_none: true,
  };
  const sendDiff = {
    flagid, // staff ID
    classinfo: classInfo,
    piclist: '',
    belong_user_id: order.user_id,
    urltype: String(order.urltype), // there's type inconsistent
    tuan: String(order.tuan),
    toc_package_id: classData.package_id,
    toc_package_name: classData.package_name,
    toc_term_id: classData.term_id,
    toc_term_name: classData.term_name,
    toc_class_id: classData.class_id,
    toc_class_name: classData.class_name,
    change_num: 1, // ?
  };
  const toSend = {
    ...order,
    ...sendDiff,
    ...sendExtra,
  };

  return postFestivalData(
    token,
    'https://festival.codemao.cn/yyb2019/index/editOrder',
    toSend
  );
};

const getLoginFlagid = (token: string): Promise<number | null> => {
  return getFestivalData(
    token,
    'https://festival.codemao.cn/yyb2019/index/info'
  ).then((res) => res?.info?.id ?? null);
};

/**
 * 
 * @param token 
 * @param ownerName 
 * @returns info[]
del: 0
flag: 2
id: 3914
name: "晏露瑕"
tuan: 65
username: "yanluxia@codemao.cn"
 */
const getOwnerByName = (token: string, ownerName: string) => {
  return postFestivalData(
    token,
    'https://festival.codemao.cn/yyb2019/index/checkTeacherFilter',
    { name: ownerName }
  );
};

/**
 *
 * @param token
 * @param email
 * @returns info[]
flag: 2
group: 23
id: 3914
name: "晏露瑕"
payinfo: 0
payinfo2: 0
payinfo3: 0
tuan: 65
username: "yanluxia@codemao.cn"
 */
export const getOwnerByEmail = (
  token: string,
  email?: string
): Promise<OwnerData> => {
  return postFestivalData(
    token,
    'https://festival.codemao.cn/yyb2019/index/checkAchievement',
    { teacher: email }
  ).then((res) => {
    const { info } = res;

    if (info.length === 1) {
      return info[0];
    } else {
      throw Error('未找到归属人信息');
    }
  });
};

/*
** 
data[]:
class_id: 52413
class_name: "A2"
nickname: "晏子导师"
package_id: 1584
package_name: "编程猫机器人系统课"
term_id: 5290
term_name: "8期"
res: 'success'
**
*/
export const getClassesData = (token: string, flagid: number) => {
  return postFestivalData(
    token,
    'https://festival.codemao.cn/yyb2019/index/toClassInfoFn',
    {
      toid: flagid,
      paytime: Math.floor(Date.now() / 1000),
    }
  ).then((res) => res.data ?? []);
};

export const filterOutClassData = (
  classInfo: string,
  classesData?: ClassData[]
): ClassData | null => {
  if (!classesData) return null;

  for (let classData of classesData) {
    if (classDataToClassInfo(classData) === classInfo) {
      return classData;
    }
  }
  return null;
};

export const testHasAccess = async (token: string, userId: string) => {
  try {
    await getOrderDataByUser(token, userId, '', '');
    return true;
  } catch (errCode) {
    if (errCode === 50008) {
      alert('账号已在别处登录');
    }
    return false;
  }
};

export const getOrdersData = (
  token: string,
  toCheckIds: string[],
  workName: string,
  ownerName: string
) => {
  if (!toCheckIds.length) return [];

  return Promise.all(
    toCheckIds.map((id) => getOrderDataByUser(token, id, workName, ownerName))
  );
};

export const claimOrders = async (
  token: string,
  notClaimedOrders: Order[],
  classInfo: string,
  ownerData: OwnerData
) => {
  if (notClaimedOrders.length === 0) return;

  const flagid = ownerData.id;
  const classesData = await getClassesData(token, flagid);
  const classData = filterOutClassData(classInfo, classesData);

  if (classData) {
    return Promise.all(
      notClaimedOrders.map((order) =>
        claimOrder(token, order, flagid, classData, classInfo)
      )
    );
  } else {
    throw Error('未找到班级信息');
  }
};

export const getStudentsByClass = (classId: number, termId: number) => {
  return postCrmData('http://42.194.164.225:3000/class/students', {
    class_id: classId,
    term_id: termId,
  }).then((data) =>
    data.items.map((item: StudentBE) => ({
      ...item,
      contact_name: item.parent_name || item.child_name,
      phone_number_formatted: formatPhone(item.phone_number),
    }))
  );
};

export const getLogisticsByPhone = (phone: string) => {
  return postCrmData('http://42.194.164.225:3000/student/logistics', {
    phone,
  }).then((data) =>
    (data?.data?.items ?? []).map(
      (item: LogisticItemBE): LogisticItem => ({
        phone,
        goods_desc: item.goodsDesc?.trim() || '',
        shipping_goods_desc: item.shippingGoodsDesc?.trim() || '',
        create_by_name: item.createByName?.trim() || '',
        audit_state_value: item.auditStateValue?.trim() || '',
        waybill_state_value: item.waybillStateValue?.trim() || '',
        logistics_type: item.logisticsType?.trim() || '',
        delivery_waybill_no: item.deliveryWaybillNo?.trim() || '',
        logistics_state: item.logisticsState?.trim() || '',
        consignee_name: item.consigneeName?.trim() || '',
        consignee_phone: item.consigneePhone?.trim() || '',
        consignee_province: item.province?.trim() || '',
        consignee_city: item.city?.trim() || '',
        consignee_district: item.county?.trim() || '',
        consignee_address: item.streetAddress?.trim() || '',

        create_time: item.createTime
          ? dayjs(item.createTime * 1000).format('YYYY-MM-DD HH:mm:ss')
          : '',
        delivery_time: item.deliveryTime
          ? dayjs(item.deliveryTime * 1000).format('YYYY-MM-DD HH:mm:ss')
          : '',
        delivery_address: `收货人: ${item.consigneeName} 联系电话: ${item.consigneePhone} 收货地址：${item.province}${item.city}${item.county}${item.streetAddress}`,
      })
    )
  );
};

const filterLogisticsWithGoods = (
  logisticItems: LogisticItem[],
  shippingGoodsDesc: string
): LogisticItem => {
  return logisticItems
    .filter(
      (item) => item.shipping_goods_desc.trim() === shippingGoodsDesc.trim()
    )
    .reduce((_, item: LogisticItem) => {
      return Object.keys(item).reduce((res: any, key) => {
        res[key] = res[key] || '' + item[key as keyof LogisticItem] || '';
        return res;
      }, {});
    }, {} as LogisticItem);
};

const getMatchedLogicsByPhone = async (
  phone: string,
  shippingGoodsDesc: string
) => {
  const items = await getLogisticsByPhone(phone);
  return filterLogisticsWithGoods(items, shippingGoodsDesc);
};

export const getMatchedLogicsByPhones = async (
  phones: string[],
  shippingGoodsDesc: string
) => {
  return Promise.all(
    phones.map((phone) => getMatchedLogicsByPhone(phone, shippingGoodsDesc))
  );
};

export const getUserClassInfo = (userId: string): Promise<ClassInfo[]> => {
  return getCrmData(`http://42.194.164.225:3000/users/${userId}`).then((data) =>
    (data?.class_info ?? []).map((item: ClassInfo) => ({
      ...item,
      user_id: userId,
    }))
  );
};

const filterUserClassInfoByPackageName = (
  classInfo: ClassInfo[],
  packageName: string
) => {
  return classInfo
    .filter((item) => item.package_name.trim() === packageName.trim())
    .reduce((_, item) => {
      return Object.keys(item).reduce((res: any, key) => {
        res[key] = res[key] || '' + item[key as keyof ClassInfo] || '';
        return res;
      }, {});
    }, {} as ClassInfo);
};

const getUserMatchedClassInfoByPackageName = async (
  userId: string,
  packageName: string
) => {
  const items = await getUserClassInfo(userId);
  return filterUserClassInfoByPackageName(items, packageName);
};

export const getMatchedClassInfosByPackageNames = async (
  userIds: string[],
  packageName: string
) => {
  return Promise.all(
    userIds.map((id) => getUserMatchedClassInfoByPackageName(id, packageName))
  );
};
