import { styled } from "@mui/material/styles";
import { Button, Divider } from "@mui/material";
import { FC, useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { ClassData, FormData, FormDataKey } from "../constants/types";
import { classDataToClassInfo } from "../helpers";

type QueryFormProps = {
  onQueryOrders: (formData: FormData) => void;
  onClaimOrders: (FormData: FormData) => void;
  onQueryLogistics: () => void;
  onQueryPreviousClassInfo: () => void;
  setFormData: (callback: (newData: FormData) => FormData) => void;
  queryDisabled: boolean;
  claimDisabled: boolean;
  getLogisticDisabled: boolean;
  getPreviousClassInfoDisabled: boolean;
  formData: FormData;
  ownerClassesData?: ClassData[];
};
const QueryForm: FC<QueryFormProps> = ({
  onQueryOrders,
  onClaimOrders,
  onQueryLogistics,
  onQueryPreviousClassInfo,
  queryDisabled,
  claimDisabled,
  getLogisticDisabled,
  getPreviousClassInfoDisabled,
  setFormData,
  formData,
  ownerClassesData,
}) => {
  const [email, setEmail] = useState(formData.ownerEmail);

  useEffect(() => {
    if (!ownerClassesData?.length) return;

    const selected = ownerClassesData.find(
      (classData) => classDataToClassInfo(classData) === formData.classInfo
    );

    modifyFormData(
      "classInfo",
      classDataToClassInfo(selected || ownerClassesData?.[0])
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerClassesData]);

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
      alert("请输入班级");
      valid = false;
    }
    return valid;
  };

  const queryHandler = () => {
    if (testValidData()) {
      onQueryOrders(formData);
    }
  };

  const clickHandler = () => {
    if (testValidData()) {
      onClaimOrders(formData);
    }
  };

  const modifyEmail = useCallback(
    debounce((value: string) => {
      modifyFormData("ownerEmail", value);
    }, 300),
    []
  );

  return (
    <div className="form_wrapper">
      <div className="form_item">
        <label>
          <span>公司邮箱</span>
          <input
            type="text"
            value={email}
            onChange={(e) => {
              const newValue = e.target.value.trim();

              setEmail(newValue);
              modifyEmail(newValue);
            }}
            placeholder="可选，若归属人有重名必填"
          />
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>班级</span>
          <select
            value={formData.classInfo}
            onChange={(e) => modifyFormData("classInfo", e.target.value.trim())}
          >
            {ownerClassesData?.map((classData) => (
              <option key={classData.class_id}>
                {classDataToClassInfo(classData)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <StyledDivider variant="middle" />

      <div className="form_item">
        <label>
          <span>内部物料</span>
          <input
            type="text"
            style={{ width: "300px" }}
            value={formData.shippingGoodsDesc}
            onChange={(e) =>
              modifyFormData("shippingGoodsDesc", e.target.value.trim())
            }
          />
        </label>
      </div>
      <Button
        id="logistic_btn"
        variant="contained"
        disabled={getLogisticDisabled}
        onClick={onQueryLogistics}
      >
        获取物流信息
      </Button>
      <StyledDivider variant="middle" />

      <div className="form_item">
        <label>
          <span>学生来自</span>
          <input
            type="text"
            style={{ width: "300px" }}
            value={formData.packageName}
            onChange={(e) =>
              modifyFormData("packageName", e.target.value.trim())
            }
          />
        </label>
      </div>
      <Button
        id="logistic_btn"
        variant="contained"
        disabled={getPreviousClassInfoDisabled}
        onClick={onQueryPreviousClassInfo}
      >
        获取原班主任信息
      </Button>
      <StyledDivider variant="middle" />

      <div className="form_item">
        <label>
          <span>项目链接名称</span>
          <input
            type="text"
            id="work_name"
            value={formData.workName}
            onChange={(e) => modifyFormData("workName", e.target.value.trim())}
            placeholder="支持模糊匹配，eg.【高阶】机器人高阶课-6期"
          />
        </label>
      </div>

      <div id="btns">
        <Button
          variant="contained"
          disabled={queryDisabled}
          onClick={queryHandler}
          style={{ marginRight: "10px" }}
        >
          查询已购买{"|"}已领单
        </Button>
        <Button
          variant="contained"
          disabled={claimDisabled}
          onClick={clickHandler}
          color="error"
        >
          点我自动领单
        </Button>
      </div>
    </div>
  );
};

const StyledDivider = styled(Divider)(() => ({
  margin: "10px 0 0 0",
  borderStyle: "dotted",
}));

export default QueryForm;
