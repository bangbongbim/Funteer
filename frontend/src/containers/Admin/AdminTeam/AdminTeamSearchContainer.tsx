import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Pagination from '@mui/material/Pagination';
import { openModal } from '../../../store/slices/fileModalSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { RootState } from '../../../store/store';
import { requestTeams, requestWithdrawTeam } from '../../../api/admin';
import { AdminTeamInterface } from '../../../types/user';
import styles from './AdminTeamSearchContainer.module.scss';

function AdminTeamSearchContainer() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState<string>('');
  const dn = useAppSelector((state: RootState) => state.fileModalSlice.deniedNum);
  const [page, setPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(0);
  const [pageTeams, setPageTeams] = useState<AdminTeamInterface[]>([]);
  // const [TeamStateFilter, setTeamStateFilter] = useState<string>(TeamState.All);

  useEffect(() => {
    if (!keyword) {
      setKeyword(location.state.keyword);
    } else {
      requestPageTeams();
    }
  }, [keyword, page]);

  useEffect(() => {
    if (dn) {
      goDenyPage();
    }
  }, [dn]);

  /** 필터 변경 */
  // const onTeamStateFilterChangeHandler = (e: SelectChangeEvent) => {
  //   setTeamStateFilter(e.target.value);
  // };

  /** 필터 적용 */
  // const filtedTeams = pageTeams.filter((Team) => {
  //   let filter;
  //   if (TeamStateFilter === '전체') {
  //     filter = Team.name.includes(TeamSearch) || Team.email.includes(TeamSearch) || Team.phone.includes(TeamSearch) || Team.vmsNum.includes(TeamSearch);
  //   } else {
  //     filter =
  //       (Team.name.includes(TeamSearch) || Team.email.includes(TeamSearch) || Team.phone.includes(TeamSearch) || Team.vmsNum.includes(TeamSearch)) &&
  //       Team.teamState === TeamStateFilter;
  //   }
  //   return filter;
  // });

  const handleFileBtn = (id: number, vf: string, pf: string, e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(openModal({ isOpen: true, userId: id.toString(), vmsFileUrl: vf, performFileUrl: pf, deniedNum: '' }));
  };

  /** 거부 페이지 이동 함수 */
  const goDenyPage = () => {
    navigate(`../team/deny/${dn}`, {
      state: {
        dn,
      },
    });
  };

  /** 단체 탈퇴 버튼 클릭 */
  const handleWithdrawBtn = (e: React.MouseEvent<SVGElement>, userId: number) => {
    withdrawTeam(userId);
  };

  /** 페이지 교체 */
  const handleChangePage = (e: React.ChangeEvent<any>, selectedPage: number) => {
    setPage(selectedPage);
  };

  /** 페이지 팀 요청 */
  const requestPageTeams = async () => {
    setPageTeams([]);
    try {
      const response = await requestTeams(page - 1, 8, keyword);
      console.log(response);
      setMaxPage(response.data.totalPages);
      setPageTeams(response.data.userList);
    } catch (error) {
      console.error(error);
    }
  };

  /** 단체 회원 탈퇴 요청 */
  const withdrawTeam = async (userId: number) => {
    try {
      const response = await requestWithdrawTeam(userId);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  // const onTeamStateChangeHandler = (e: SelectChangeEvent) => {
  //   console.log('단체 회원 상태 변경 요청');
  //   window.location.reload();
  // };

  // const teamStateSet = Object.values(TeamState);

  return (
    <div className={styles.container}>
      <div className={styles.contents}>
        <h1 className={styles.title}>단체 회원관리</h1>
        <h3 className={styles.keyword}>
          검색어: <span>{keyword}</span>
        </h3>
        <ul className={styles['title-line']}>
          <li>번호</li>
          <li>단체명</li>
          <li>이메일</li>
          <li>대표자 번호</li>
          <li>인증 파일</li>
          <li>상태</li>
          <li> </li>
        </ul>
        {pageTeams.map((data) => (
          <ul key={data.userId} className={styles['list-line']}>
            <li>{data.userId}</li>
            <li>
              <p>{data.name}</p>
            </li>
            <li>
              <p>{data.email}</p>
            </li>
            <li>
              <p>{data.phone}</p>
            </li>
            <li>
              <button
                type="button"
                className={styles['file-btn']}
                onClick={(e) => {
                  handleFileBtn(data.userId, data.vmsFileUrl, data.performFileUrl, e);
                }}
              >
                확인
              </button>
            </li>
            <li>string</li>
            <li>
              <AiOutlineClose className={styles['withdraw-btn']} onClick={(e) => handleWithdrawBtn(e, data.userId)} />
            </li>
          </ul>
        ))}
        <Pagination sx={{ marginTop: '2rem' }} count={maxPage} page={page} onChange={handleChangePage} />
      </div>
    </div>
  );
}

export default AdminTeamSearchContainer;
