import { FC, useEffect, useMemo, useState } from 'react';
import { ClassInfo, LogisticItem, Order, Student } from '../constants/types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import EnhancedTableHead, { HeadCell } from './common/EnhancedTableHead';
import { encodePhone, getComparator, Order as ColumnOrder } from '../helpers';
import { getColumnMinWidth, getColumns } from '../constants/columns';

export type StudentTableRow = Student & {
  paid?: string;
  claimed?: string;
  index?: number;
  should_delivery_address?: string;
  address_correct_status?: string;
  contact_name?: string;
  phone_number_formatted?: string;
  [key: string]: any;
} & Partial<LogisticItem> &
  Partial<ClassInfo> &
  Partial<Order>;

type StuTableProps = {
  data: StudentTableRow[];
  paidOrders: Order[];
  claimedOrders: Order[];
  logisticItems: (LogisticItem | undefined)[];
  classInfos: (ClassInfo | undefined)[];
  setRows: (callback: (prevRows: any[]) => any) => void;
  teacherName?: string;
};
const StuTable: FC<StuTableProps> = ({
  data = [],
  paidOrders = [],
  claimedOrders = [],
  logisticItems,
  classInfos,
  setRows,
  teacherName,
}) => {
  const [order, setOrder] = useState<ColumnOrder>('asc');
  const [orderBy, setOrderBy] = useState<string>('');

  /**
   * Set's value will update every time this compo renders
   * Use useMemo to prevent that
   * */
  const paidUserPhoneToOrder: Record<string, Order> = useMemo(
    () =>
      paidOrders.reduce(
        (res, item) => ({ ...res, [item.phone_number]: item }),
        {}
      ),
    [paidOrders]
  );
  const claimedUserPhoneToOrder: Record<string, Order> = useMemo(
    () =>
      claimedOrders.reduce(
        (res, item) => ({ ...res, [item.phone_number]: item }),
        {}
      ),
    [claimedOrders]
  );

  useEffect(() => {
    if (Object.keys(paidUserPhoneToOrder).length) {
      setRows((prevRows) =>
        prevRows.map((row) => {
          const order = paidUserPhoneToOrder[row.phone_number];
          let value = !!order ? '是' : '-';
          if (order) {
            if (String(order.user_id) !== String(row.user_id)) {
              value = `是 购买ID:${order.user_id}`;
            } else {
              value = '是';
            }
          } else {
            value = '-';
          }

          return {
            ...row,
            paid: value,
            flagid_name: paidUserPhoneToOrder[row.phone_number]?.flagid_name,
          };
        })
      );
    }
    if (Object.keys(claimedUserPhoneToOrder).length) {
      setRows((prevRows) =>
        prevRows.map((row) => {
          const value = !!claimedUserPhoneToOrder[row.phone_number]
            ? '是'
            : '-';
          return {
            ...row,
            claimed: value,
          };
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidUserPhoneToOrder, claimedUserPhoneToOrder]);

  useEffect(() => {
    if (logisticItems.length) {
      const phoneToItem = logisticItems.reduce((res: any, item) => {
        if (!item) return res;

        res[item.phone] = item;
        return res;
      }, {});

      setRows((prevRows) => {
        return prevRows.map((row) => {
          const logisticItem = phoneToItem[row.phone_number];

          if (!logisticItem) return row;

          const addressErrInfos = [];

          if (encodePhone(row?.phone_number) !== logisticItem.consignee_phone) {
            addressErrInfos.push('号码');
          }

          if (row.province !== logisticItem.consignee_province) {
            addressErrInfos.push('省份');
          }

          if (row.city !== logisticItem.consignee_city) {
            addressErrInfos.push('城市');
          }

          if (row.district !== logisticItem.consignee_district) {
            addressErrInfos.push('地区');
          }

          if (row.address !== logisticItem.consignee_address) {
            addressErrInfos.push('详细地址');
          }

          return {
            ...row,
            ...logisticItem,
            should_delivery_address: `收货人: ${row.contact_name} 联系电话: ${row.phone_number} 收货地址：${row.province}${row.city}${row.district}${row.address}`,
            address_correct_status: logisticItem.logistics_type
              ? !addressErrInfos.length
                ? '是'
                : addressErrInfos.join('、') + '不匹配'
              : '-',
          };
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logisticItems]);

  useEffect(() => {
    if (classInfos.length) {
      const userIdToItem = classInfos.reduce((res: any, item) => {
        if (!item) return res;

        res[item.user_id] = item;
        return res;
      }, {});

      setRows((prevRows) => {
        return prevRows.map((row) => {
          if (!userIdToItem[row.user_id]) return row;

          return {
            ...row,
            ...userIdToItem[row.user_id],
          };
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classInfos]);

  useEffect(() => {
    if (paidOrders.length) {
      const userIdToItem = paidOrders.reduce((res: any, item) => {
        if (!item) return res;

        res[item.user_id] = item;
        return res;
      }, {});

      setRows((prevRows) => {
        return prevRows.map((row) => {
          if (!userIdToItem[row.user_id]) return row;

          return {
            ...row,
            ...userIdToItem[row.user_id],
          };
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidOrders]);

  if (!data.length) return null;

  const hasPaidOrders = paidOrders.length > 0;
  const hasClaimedOrders = claimedOrders.length > 0;

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', height: '100%' }}>
      <TableContainer sx={{ height: '100%' }}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          stickyHeader
          aria-label="sticky table"
        >
          <EnhancedTableHead
            onRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
            headCells={getColumns(
              hasPaidOrders,
              hasClaimedOrders,
              !!logisticItems.length,
              !!classInfos.length
            ).map(
              (item) =>
                ({
                  ...item,
                  numeric: false,
                  sortable: true,
                  disablePadding: true,
                  minWidth: getColumnMinWidth(item.id),
                  align: 'center',
                } as HeadCell)
            )}
          />
          <TableBody>
            {data
              .slice()
              .sort(getComparator(order, orderBy))
              .map((row) => (
                <StyledTableRow
                  key={row.user_id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{row.index}</TableCell>
                  <TableCell sx={{ maxWidth: '100px' }}>
                    <img src={row.avatar_url} className="avatar" alt="avatar" />
                    &nbsp;
                    <span
                      style={{
                        display: 'inline-block',
                        width: ' 60%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1',
                        verticalAlign: 'middle',
                      }}
                      title={row.nickname}
                    >
                      {row.nickname}
                    </span>
                  </TableCell>
                  <TableCell>{row.child_name}</TableCell>
                  {hasPaidOrders && (
                    <>
                      <TableCell>{row.work_name}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            color: row.paid !== row.claimed ? 'red' : undefined,
                          }}
                        >
                          {row.paid}
                        </span>
                      </TableCell>
                    </>
                  )}
                  {hasClaimedOrders && (
                    <>
                      <TableCell>
                        <span
                          style={{
                            color: row.paid !== row.claimed ? 'red' : undefined,
                          }}
                        >
                          {row.claimed}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            color:
                              row.flagid_name !== teacherName
                                ? 'red'
                                : undefined,
                          }}
                        >
                          {row.flagid_name}
                        </span>
                      </TableCell>
                    </>
                  )}
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.phone_number_formatted}</TableCell>

                  {!!logisticItems.length && (
                    <>
                      <TableCell>{row.goods_desc}</TableCell>
                      <TableCell>{row.shipping_goods_desc}</TableCell>
                      <TableCell>{row.create_time}</TableCell>
                      <TableCell>{row.create_by_name}</TableCell>
                      <TableCell>{row.audit_state_value}</TableCell>
                      <TableCell>{row.waybill_state_value}</TableCell>
                      <TableCell>{row.delivery_time}</TableCell>
                      <TableCell>{row.delivery_address}</TableCell>
                      <TableCell>{row.should_delivery_address}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            color:
                              row.address_correct_status !== '是' &&
                              row.address_correct_status !== '-'
                                ? 'red'
                                : undefined,
                          }}
                        >
                          {row.address_correct_status}
                        </span>
                      </TableCell>
                      <TableCell>{row.logistics_type}</TableCell>
                      <TableCell>{row.delivery_waybill_no}</TableCell>
                      <TableCell>{row.logistics_state}</TableCell>
                    </>
                  )}
                  <TableCell>{row.contact_name}</TableCell>
                  <TableCell>{row.user_id}</TableCell>
                  <TableCell>{row.phone_number}</TableCell>

                  <TableCell align="center">{row.province}</TableCell>
                  <TableCell align="center">{row.city}</TableCell>
                  <TableCell align="center">{row.district}</TableCell>
                  <TableCell>{row.address}</TableCell>

                  {!!classInfos.length && (
                    <>
                      <TableCell>{row.package_name}</TableCell>
                      <TableCell>{row.teacher_name}</TableCell>
                      <TableCell>{row.teacher_nickname}</TableCell>
                    </>
                  )}
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default StuTable;
