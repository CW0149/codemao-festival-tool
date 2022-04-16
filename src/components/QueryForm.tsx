import { styled } from '@mui/material/styles';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { FC, useCallback, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import { ClassData, FormData, FormDataKey } from '../constants/types';
import { classDataToClassInfo } from '../helpers';
import { Box } from '@mui/system';

type QueryFormProps = {
  onQueryOrders: (formData: FormData) => void;
  onClaimOrders: (FormData: FormData) => void;
  onQueryLogistics: () => void;
  onQueryPreviousClassInfo: () => void;
  setFormData: (callback: (newData: FormData) => FormData) => void;
  queryOrderDisabled: boolean;
  claimOrderDisabled: boolean;
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
  queryOrderDisabled,
  claimOrderDisabled,
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
      'classInfo',
      classDataToClassInfo(selected || ownerClassesData?.[0])
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerClassesData]);

  const modifyFormData = (key: FormDataKey, value: string) => {
    setFormData((prevData) => {
      return { ...prevData, [key]: value?.trim() };
    });
  };

  const testValidData = () => {
    let valid = true;

    if (!formData.token) {
      alert('请输入token');
      valid = false;
    }
    if (!formData.workName) {
      alert('请输入项目链接名');
      valid = false;
    }
    if (!formData.classInfo) {
      alert('请输入班级');
      valid = false;
    }
    return valid;
  };

  const queryHandler = () => {
    if (testValidData()) {
      onQueryOrders(formData);
    }
  };

  const claimHandler = () => {
    if (testValidData()) {
      onClaimOrders(formData);
    }
  };

  const modifyEmail = useCallback(
    debounce((value: string) => {
      modifyFormData('ownerEmail', value);
    }, 300),
    []
  );

  return (
    <Grid container spacing={1}>
      <Grid item md={12} xs={12}>
        <StyledBox>
          <Grid container spacing={1}>
            <Grid item md={6} xs={6}>
              <TextField
                size="small"
                fullWidth
                label="公司邮箱"
                value={email}
                onChange={(e) => {
                  const newValue = e.target.value;

                  setEmail(newValue);
                  modifyEmail(newValue);
                }}
                placeholder="可选，若归属人有重名必填"
              />
            </Grid>
            <Grid item md={6} xs={6}>
              <FormControl fullWidth>
                <InputLabel>班级</InputLabel>
                <Select
                  size="small"
                  label="班级"
                  value={formData.classInfo}
                  onChange={(e) => modifyFormData('classInfo', e.target.value)}
                >
                  {ownerClassesData?.map((classData) => (
                    <MenuItem
                      key={classData.class_id}
                      value={classDataToClassInfo(classData)}
                    >
                      {classDataToClassInfo(classData)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </StyledBox>
      </Grid>
      <Grid item md={4} xs={12}>
        <StyledBox>
          <Grid container spacing={1}>
            <Grid item md={12} xs={6}>
              <TextField
                size="small"
                fullWidth
                label="内部物料"
                value={formData.shippingGoodsDesc}
                onChange={(e) =>
                  modifyFormData('shippingGoodsDesc', e.target.value)
                }
              />
            </Grid>
            <Grid item md={12} xs={6}>
              <LoadingButton
                id="logistic_btn"
                fullWidth
                variant="contained"
                loading={getLogisticDisabled}
                onClick={onQueryLogistics}
              >
                获取物流信息
              </LoadingButton>
            </Grid>
          </Grid>
        </StyledBox>
      </Grid>

      <Grid item md={4} xs={12}>
        <StyledBox>
          <Grid container spacing={1}>
            <Grid item md={12} xs={6}>
              <TextField
                size="small"
                fullWidth
                label="学生来自"
                value={formData.packageName}
                onChange={(e) => modifyFormData('packageName', e.target.value)}
              />
            </Grid>
            <Grid item md={12} xs={6}>
              <LoadingButton
                id="logistic_btn"
                fullWidth
                variant="contained"
                loading={getPreviousClassInfoDisabled}
                onClick={onQueryPreviousClassInfo}
              >
                获取原班主任信息
              </LoadingButton>
            </Grid>
          </Grid>
        </StyledBox>
      </Grid>

      <Grid item md={4} xs={12}>
        <StyledBox>
          <Grid container spacing={1}>
            <Grid item md={12} xs={6}>
              <TextField
                size="small"
                fullWidth
                label="项目链接名称"
                id="work_name"
                value={formData.workName}
                onChange={(e) => modifyFormData('workName', e.target.value)}
                placeholder="支持模糊匹配，eg. 机器人高阶课"
              />
            </Grid>
            <Grid item md={12} xs={6}>
              <Grid container spacing={1}>
                <Grid item md={6} xs={6}>
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    loading={queryOrderDisabled}
                    onClick={queryHandler}
                    style={{ marginRight: '10px' }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      查询已购买{'|'}已领单
                    </span>
                  </LoadingButton>
                </Grid>
                <Grid item md={6} xs={6}>
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    disabled={claimOrderDisabled}
                    onClick={claimHandler}
                    color="error"
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      点我自动领单
                    </span>
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </StyledBox>
      </Grid>
    </Grid>
  );
};

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  paddingTop: theme.spacing(2),
  background: '#fff',
  borderRadius: '4px',
}));

export default QueryForm;
