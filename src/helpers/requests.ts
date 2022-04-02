import { postData, getData } from ".";
import { ClassData, Order, OrderData } from "../constants/types";

/**
 *
 * workName: string, // 项目链接名称
 * ownerName: string // 归属人
 */

const queryOrder = (token: string, userId: string) => {
  return postData(
    token,
    "https://festival.codemao.cn/yyb2019/index/checkAddOrder",
    {
      flag: "4",
      work_name: "",
      tit: "",
      times: [],
      begin: "",
      end: "",
      totimes: [],
      tobegin: "",
      toend: "",
      toflag: "all",
      username: "",
      tel: "",
      type: 2,
      paytit: "",
      user_id: userId,
      login_name: "",
      term_name: "",
      teacher_name: "",
      page: 1,
      out_trade_no: "",
      classinfo: "",
      businessType: "all",
      isflag: "",
      teacher_email_1000: "",
      teacher_email_16: "",
      teacher_email_ti: "",
      teacher_email_nian: "",
      nickname: "",
      claim_status: "all",
      tianmaocode: "",
      payment_method: "all",
      hand_name: "",
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
  if (res.res === "error") {
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
    piclist: "",
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

  return postData(
    token,
    "https://festival.codemao.cn/yyb2019/index/editOrder",
    toSend
  );
};

const getLoginFlagid = (token: string): Promise<number | null> => {
  return getData(token, "https://festival.codemao.cn/yyb2019/index/info").then(
    (res) => res?.info?.id ?? null
  );
};

const getFlagid = (
  token: string,
  ownerName: string,
  ownerEmail?: string
): Promise<number | null> => {
  return postData(
    token,
    "https://festival.codemao.cn/yyb2019/index/checkTeacherFilter",
    { name: ownerName }
  ).then((data) => {
    const { info = [] } = data;

    // Means no same name
    if (info.length === 1) {
      return info[0].id;
    }

    // Means has same name
    if (ownerEmail) {
      for (let flag of info) {
        if (flag.username === ownerEmail) {
          return flag.id;
        }
      }
    } else {
      alert("可能存在同名归属人，请输入归属人邮箱");
    }
    return null;
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
const getClassesData = (token: string, flagid: number) => {
  return postData(
    token,
    "https://festival.codemao.cn/yyb2019/index/toClassInfoFn",
    {
      toid: flagid,
      paytime: Math.floor(Date.now() / 1000),
    }
  ).then((res) => res.data ?? []);
};

const filterOutClassData = (
  classInfo: string,
  classesData: ClassData[]
): ClassData | null => {
  for (let classData of classesData) {
    const { package_name, term_name, class_name } = classData;
    if (package_name + term_name + class_name === classInfo) {
      return classData;
    }
  }
  return null;
};

export const testHasAccess = async (token: string, userId: string) => {
  try {
    await getOrderDataByUser(token, userId, "", "");
    return true;
  } catch (errCode) {
    if (errCode === 50008) {
      alert("账号已在别处登录");
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
  ownerName: string,
  ownerEmail?: string
) => {
  if (notClaimedOrders.length === 0) return;

  const flagid = await getFlagid(token, ownerName, ownerEmail);

  if (flagid) {
    const classesInfo = await getClassesData(token, flagid);
    const classData = filterOutClassData(classInfo, classesInfo);

    if (classData) {
      return Promise.all(
        notClaimedOrders.map((order) =>
          claimOrder(token, order, flagid, classData, classInfo)
        )
      );
    } else {
      alert("未找到班期信息");
    }
  } else {
    alert("请求归属人信息出错");
  }
};
