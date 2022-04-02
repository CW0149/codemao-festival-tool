import React, { FC, useEffect, useState } from "react";
import { formData as MockedFormData } from "../mocks/formData";
import {
  ClassData,
  FormData,
  FormDataKey,
  OwnerData,
} from "../constants/types";
import { getClassesData, getOwnerByEmail } from "../helpers/requests";

type QueryFormProps = {
  onQueryOrders: (formData: FormData, ownerData: OwnerData) => void;
  onClaimOrders: (FormData: FormData, ownerData: OwnerData) => void;
  queryDisabled: boolean;
  claimDisabled: boolean;
};
const QueryForm: FC<QueryFormProps> = ({
  onQueryOrders,
  onClaimOrders,
  queryDisabled,
  claimDisabled,
}) => {
  const [formData, setFormData] = useState(MockedFormData);
  const [ownerData, setOwnerData] = useState<OwnerData>();
  const [ownerClassesData, setOwnerClassesData] = useState<ClassData[]>();

  useEffect(() => {
    try {
      getOwnerByEmail(formData.token, formData.ownerEmail).then((owner) => {
        setOwnerData(owner);
        getClassesData(formData.token, owner.id).then((classesData) => {
          setOwnerClassesData(classesData);
        });
      });
    } catch (err) {
      alert(err);
    }
  }, [formData.ownerEmail, formData.token]);

  const modifyFormData = (key: FormDataKey, value: string) => {
    setFormData((prevData) => {
      return { ...prevData, [key]: value };
    });
  };

  const testValidData = () => {
    let valid = true;

    if (!formData.ids) {
      alert("请输入用户ID");
      valid = false;
    }
    if (!formData.token) {
      alert("请输入token");
      valid = false;
    }
    if (!formData.workName) {
      alert("请输入项目链接名");
      valid = false;
    }
    if (!formData.classInfo) {
      alert("请输入班期");
      valid = false;
    }
    return valid;
  };

  const queryHandler = () => {
    if (testValidData() && ownerData) {
      onQueryOrders(formData, ownerData);
    }
  };

  const clickHandler = () => {
    if (testValidData() && ownerData) {
      onClaimOrders(formData, ownerData);
    }
  };

  return (
    <>
      <div>
        <label>
          <span>用户ID</span>
          <textarea
            name="用户ID"
            id="user_ids"
            cols={30}
            rows={10}
            value={formData.ids}
            onChange={(e) => modifyFormData("ids", e.target.value.trim())}
            placeholder="请粘贴入用户ID，ID用换行分隔
eg.
6540093
17436072
13298232
"
          />
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>下单链接名称</span>
          <input
            type="text"
            id="work_name"
            value={formData.workName}
            onChange={(e) => modifyFormData("workName", e.target.value.trim())}
            placeholder="支持模糊匹配，eg.【高阶】机器人高阶课-6期"
          />
        </label>
      </div>
      {/* <div className="form_item">
        <label>
          <span>归属人</span>
          <input
            type="text"
            id="flagid_name"
            value={formData.ownerName}
            onChange={(e) => modifyFormData("ownerName", e.target.value.trim())}
          />
        </label>
      </div> */}
      <div className="form_item">
        <label>
          <span>归属人邮箱</span>
          <input
            type="text"
            value={formData.ownerEmail}
            onChange={(e) =>
              modifyFormData("ownerEmail", e.target.value.trim())
            }
            placeholder="可选，若归属人有重名必填"
          />
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>设置归属班期</span>
          <select
            value={formData.classInfo}
            onChange={(e) => modifyFormData("classInfo", e.target.value.trim())}
          >
            {ownerClassesData?.map((classData) => (
              <option key={classData.class_id}>
                {classData.package_name +
                  classData.term_name +
                  classData.class_name}
              </option>
            ))}
          </select>
          {/* <input
            type="text"
            width="200"
            value={formData.classInfo}
            onChange={(e) => modifyFormData("classInfo", e.target.value.trim())}
          /> */}
        </label>
      </div>
      <div className="btns">
        <button id="query_btn" disabled={queryDisabled} onClick={queryHandler}>
          查询
        </button>
        <button id="claim_btn" disabled={claimDisabled} onClick={clickHandler}>
          自动领单-请确保归属信息准确
        </button>
      </div>
      <hr />
    </>
  );
};

export default QueryForm;
