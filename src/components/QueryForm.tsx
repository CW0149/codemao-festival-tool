import React, { FC, useEffect, useState } from "react";
import { formData as MockedFormData } from "../mocks/formData";
import {
  ClassData,
  FormData,
  FormDataKey,
  OwnerData,
  Student,
} from "../constants/types";
import {
  filterOutClassData,
  getClassesData,
  getOwnerByEmail,
  getStudentsByClass,
} from "../helpers/requests";

type QueryFormProps = {
  onQueryOrders: (
    formData: FormData,
    ownerData: OwnerData,
    classStudents: Student[]
  ) => void;
  onClaimOrders: (
    FormData: FormData,
    ownerData: OwnerData,
    classStudents: Student[]
  ) => void;
  setQueryDisabled: (disabled: boolean) => void;
  queryDisabled: boolean;
  claimDisabled: boolean;
};
const QueryForm: FC<QueryFormProps> = ({
  onQueryOrders,
  onClaimOrders,
  queryDisabled,
  claimDisabled,
  setQueryDisabled,
}) => {
  const [formData, setFormData] = useState(MockedFormData);
  const [ownerData, setOwnerData] = useState<OwnerData>();
  const [ownerClassesData, setOwnerClassesData] = useState<ClassData[]>();
  const [classStudents, setClassStudents] = useState([]);

  useEffect(() => {
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

  const modifyFormData = (key: FormDataKey, value: string) => {
    setFormData((prevData) => {
      return { ...prevData, [key]: value };
    });
  };

  const testValidData = () => {
    let valid = true;

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
      onQueryOrders(formData, ownerData, classStudents);
    }
  };

  const clickHandler = () => {
    if (testValidData() && ownerData) {
      onClaimOrders(formData, ownerData, classStudents);
    }
  };

  return (
    <div className="form_wrapper">
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
        </label>
      </div>
      <div className="btns">
        <button id="query_btn" disabled={queryDisabled} onClick={queryHandler}>
          查询
        </button>
        <button id="claim_btn" disabled={claimDisabled} onClick={clickHandler}>
          点我领单-请确保归属信息准确
        </button>
      </div>
      <hr />
    </div>
  );
};

export default QueryForm;
