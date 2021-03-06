import { styled } from '@mui/material/styles';
import {
  Autocomplete,
  Checkbox,
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
import { ClassData, FormData, FormDataKey, Student } from '../constants/types';
import { classDataToClassInfo } from '../helpers';
import { Box } from '@mui/system';
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

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
  classStudents: Student[];
  selectedStudents: Student[];
  setSelectedStudents: (newData: Student[]) => void;
  isQueryingStudents: boolean;
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
  classStudents,
  selectedStudents,
  setSelectedStudents,
  isQueryingStudents,
}) => {
  const [tempStudents, setTempStudents] = useState(selectedStudents);
  const [email, setEmail] = useState(formData.ownerEmail);

  useEffect(() => {
    setTempStudents(selectedStudents);
  }, [selectedStudents]);

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
      alert('?????????token');
      valid = false;
    }
    if (!formData.workName) {
      alert('????????????????????????');
      valid = false;
    }
    if (!formData.classInfo) {
      alert('???????????????');
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
          <Grid container spacing={1} rowSpacing={2}>
            <Grid item md={4} xs={12}>
              <TextField
                size="small"
                fullWidth
                label="????????????"
                value={email}
                onChange={(e) => {
                  const newValue = e.target.value;

                  setEmail(newValue);
                  modifyEmail(newValue);
                }}
                placeholder="????????????????????????????????????"
              />
            </Grid>
            <Grid item md={4} xs={12}>
              <FormControl fullWidth>
                <InputLabel>??????</InputLabel>
                <Select
                  size="small"
                  label="??????"
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
            <Grid item md={4} xs={12}>
              <Autocomplete
                disabled={isQueryingStudents}
                multiple
                disableCloseOnSelect
                limitTags={1}
                size="small"
                value={tempStudents}
                options={classStudents}
                renderOption={(props, option, { selected }) => (
                  <li key={option.user_id} {...props}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {`${option.child_name} [${option.nickname}]`}
                  </li>
                )}
                getOptionLabel={(option) =>
                  `${option.child_name} [${option.nickname}]`
                }
                renderInput={(params) => <TextField {...params} label="??????" />}
                onChange={(e, newValue) => {
                  setTempStudents(newValue);
                }}
                onClose={() => {
                  console.log('onclose');
                  setSelectedStudents(tempStudents);
                }}
                onBlur={() => {
                  console.log('onBlur');
                  if (!tempStudents.length) {
                    setSelectedStudents(classStudents);
                  }
                }}
              />
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
                label="????????????"
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
                ??????????????????
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
                label="????????????"
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
                ????????????????????????
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
                label="??????????????????"
                id="work_name"
                value={formData.workName}
                onChange={(e) => modifyFormData('workName', e.target.value)}
                placeholder="?????????????????????eg. ??????????????????"
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
                      ???????????????{'|'}?????????
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
                      ??????????????????
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
