import { Box, Button, Link } from '@mui/material';
import { FC } from 'react';
import CsvDownloader, { ICsvProps } from 'react-csv-downloader';

type Props = {
  filename: string;
  rows: ICsvProps['datas'];
  columns: ICsvProps['columns'];
};
export const MoreTools: FC<Props> = ({ filename, rows, columns }) => {
  return (
    <Box sx={{ p: 1, background: '#fff' }}>
      <Link href="https://www.cordcloud.biz/user" target="_blank">
        <Button
          variant="contained"
          sx={{ width: '100%', marginBottom: 1 }}
          color="secondary"
        >
          科学上网
        </Button>
      </Link>
      <Link
        href="https://chrome.google.com/webstore/detail/%E7%8F%AD%E6%9C%9F%E5%B7%A5%E5%85%B7/ecibdknchcmcamhoafledcagpidalomj?hl=zh-CN"
        target="_blank"
      >
        <Button
          variant="contained"
          sx={{ width: '100%', marginBottom: 1 }}
          color="success"
        >
          下载插件
        </Button>
      </Link>
      <CsvDownloader filename={filename} datas={rows} columns={columns}>
        <Button variant="contained" sx={{ width: '100%' }} color="primary">
          导出表格
        </Button>
      </CsvDownloader>
    </Box>
  );
};

export default MoreTools;
