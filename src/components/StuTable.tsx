import { FC, useEffect, useMemo, useState } from 'react';
import { ClassInfo, LogisticItem, Student } from '../constants/types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import EnhancedTableHead, { HeadCell } from './common/EnhancedTableHead';
import { getComparator, Order } from '../helpers';
import { getColumnMinWidth, getColumns } from '../constants/columns';

export type StudentTableRow = Student & {
  paid?: string;
  claimed?: string;
} & Partial<LogisticItem> &
  Partial<ClassInfo>;

type StuTableProps = {
  data: StudentTableRow[];
  paidOrderUserIds: string[];
  claimedOrderUserIds: string[];
  logisticItems: (LogisticItem | undefined)[];
  classInfos: (ClassInfo | undefined)[];
  setRows: (callback: (prevRows: any[]) => any) => void;
};
const StuTable: FC<StuTableProps> = ({
  data = [],
  paidOrderUserIds,
  claimedOrderUserIds,
  logisticItems,
  classInfos,
  setRows,
}) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('');

  /**
   * Set's value will update every time this compo renders
   * Use useMemo to prevent that
   * */
  const paidUserIdsSet = useMemo(
    () => new Set(paidOrderUserIds.map((id) => String(id))),
    [paidOrderUserIds]
  );
  const claimedUserIdsSet = useMemo(
    () => new Set(claimedOrderUserIds.map((id) => String(id))),
    [claimedOrderUserIds]
  );

  useEffect(() => {
    if (paidOrderUserIds.length) {
      setRows((prevRows) =>
        prevRows.map((row) => {
          const value = paidUserIdsSet.has(String(row.user_id)) ? '是' : '-';
          return {
            ...row,
            paid: value,
          };
        })
      );
    }
    if (claimedOrderUserIds.length) {
      setRows((prevRows) =>
        prevRows.map((row) => {
          const value = claimedUserIdsSet.has(String(row.user_id)) ? '是' : '-';
          return {
            ...row,
            claimed: value,
          };
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paidOrderUserIds,
    claimedOrderUserIds,
    paidUserIdsSet,
    claimedUserIdsSet,
  ]);

  useEffect(() => {
    if (logisticItems.length) {
      const phoneToItem = logisticItems.reduce((res: any, item) => {
        if (!item) return res;

        res[item.phone] = item;
        return res;
      }, {});

      setRows((prevRows) => {
        return prevRows.map((row) => {
          if (!phoneToItem[row.phone_number]) return row;

          return {
            ...row,
            ...phoneToItem[row.phone_number],
            consignee_name: row.consigneeName || row.consignee_name,
          };
        });
      });
    }
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
  }, [classInfos]);

  if (!data.length) return null;

  const hasPaidOrders = paidOrderUserIds.length > 0;
  const hasClaimedOrders = claimedOrderUserIds.length > 0;

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
              !!paidOrderUserIds.length,
              !!claimedOrderUserIds.length,
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
                  <TableCell>{row.index + 1}</TableCell>
                  <TableCell sx={{ maxWidth: '100px' }}>
                    <img src={row.avatar_url} className="avatar" alt="avatar" />
                    &nbsp;
                    {row.nickname}
                  </TableCell>
                  <TableCell>{row.child_name}</TableCell>
                  {hasPaidOrders && (
                    <TableCell>
                      <span
                        style={{
                          color: row.paid !== row.claimed ? 'red' : undefined,
                        }}
                      >
                        {row.paid}
                      </span>
                    </TableCell>
                  )}
                  {hasClaimedOrders && (
                    <TableCell>
                      <span
                        style={{
                          color: row.paid !== row.claimed ? 'red' : undefined,
                        }}
                      >
                        {row.claimed}
                      </span>
                    </TableCell>
                  )}
                  <TableCell>{row.age}</TableCell>

                  {!!logisticItems.length && (
                    <>
                      <TableCell>{row.goodsDesc}</TableCell>
                      <TableCell>{row.shippingGoodsDesc}</TableCell>
                      <TableCell>{row.createTime}</TableCell>
                      <TableCell>{row.createByName}</TableCell>
                      <TableCell>{row.auditStateValue}</TableCell>
                      <TableCell>{row.waybillStateValue}</TableCell>
                      <TableCell>{row.deliveryTime}</TableCell>
                      <TableCell>{row.logisticsType}</TableCell>
                      <TableCell>{row.deliveryWaybillNo}</TableCell>
                      <TableCell>{row.logisticsState}</TableCell>
                    </>
                  )}
                  <TableCell>{row.consignee_name}</TableCell>
                  <TableCell>{row.user_id}</TableCell>
                  <TableCell>{row.phone_number}</TableCell>
                  <TableCell>{row.phone_number_formatted}</TableCell>

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
