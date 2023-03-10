import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Box, CircularProgress, Fab, Tab, Tabs } from '@mui/material';
import { styled } from '@material-ui/styles';
import TextField from '@mui/material/TextField';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { useDispatch } from 'react-redux';
import { Viewer } from '@toast-ui/react-editor';
import FundSummary from '../../components/Cards/FundSummary';
import styles from './FundingDetailContainer.module.scss';
import { fundingJoin, requestCommentList, requestFundingDetail, requestFundingReport, requestNextCommentList, requestWish } from '../../api/funding';
import TeamInfo from '../../components/Cards/TeamInfoCard';
import DetailArcodian from '../../components/Cards/DetailArcodian';
import CommentCardSubmit from '../../components/Cards/CommentCardSubmit';
import CommentCard from '../../components/Cards/CommentCard';
import CommentSkeleton from '../../components/Skeleton/CommentSkeleton';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { requestUserProfile } from '../../api/user';
import { requestTeamAccountInfo } from '../../api/team';
import { requestCreateSession } from '../../api/live';
import ReportModal from '../../components/Modal/ReportModal';
import { openModal } from '../../store/slices/reportModalSlice';
import PdfViewer from '../../components/Funding/PdfViewer';
import { stringToSeparator, stringToNumber } from '../../utils/convert';
import { customTextOnlyAlert, noTimeSuccess } from '../../utils/customAlert';

export interface ResponseInterface {
  title: string;
  startDate: string;
  endDate: string;
  postDate: string;
  thumbnail: string;
  category: string;
  content: string;
  targetMoneyListLevelOne: targetType;
  targetMoneyListLevelTwo: targetType;
  targetMoneyListLevelThree: targetType;
  currentFundingAmount: string;
  wishCount: number;
  fundingDescription: string;
  comments: commentType[];
  team: teamType;
  fundingId: string;
  hit: number;
  participatedCount: number;
}
export type commentType = {
  commentId: number;
  memberNickName: string;
  content: string;
  memberProfileImg: string;
  regDate: string;
};
export type teamType = {
  id: number;
  email: string;
  name: string;
  phone: string;
  profileImgUrl: string;
  // performFileUrl: string;
  // vmsFileUrl: string;
};
type targetType = {
  amount?: string;
  targetMoneyType?: string;
  descriptions?: descriptionType[];
};
type descriptionType = {
  description?: string;
};

interface reportInterface {
  content?: string;
  liveUrl?: string;
  regDate?: string;
  reportDetailResponseList: responseListType[];
}
type responseListType = {
  amount?: string;
  description?: string;
};

export function FundingDetailContainer() {
  // ????????? ??????
  const reportModalState = useAppSelector((state) => state.reportModalSlice);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [commentList, setCommentList] = useState<commentType[]>([]);
  const userType = useAppSelector((state) => state.userSlice.userType);
  const { fundIdx } = useParams<string>();
  const [board, setBoard] = useState<ResponseInterface>({
    title: '',
    startDate: '',
    endDate: '',
    postDate: '',
    thumbnail: '',
    category: '',
    content: '',
    fundingDescription: '',
    targetMoneyListLevelOne: {},
    targetMoneyListLevelTwo: {},
    targetMoneyListLevelThree: {},
    currentFundingAmount: '',
    wishCount: 0,
    comments: [],
    team: {
      id: 0,
      email: '',
      name: '',
      phone: '',
      profileImgUrl: '',
    },
    fundingId: '',
    hit: 0,
    participatedCount: 0,
  });

  // ?????? ?????? ????????? ??????
  const fetchData = async () => {
    try {
      const response = await requestFundingDetail(fundIdx);
      console.log('res: ', response);
      setBoard(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ????????? ??????
  useEffect(() => {
    fetchData();
  }, []);

  // ?????? ????????????
  const [isChecked, setIsChecked] = useState<boolean>(false);
  function checkHandler(e: React.ChangeEvent<HTMLInputElement> | undefined) {
    setIsChecked(!isChecked);
  }

  // ?????? ?????????
  // ?????? ????????? ?????????

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  const initCommentList = async () => {
    try {
      // setIsLoading(true);
      const { data } = await requestCommentList(fundIdx, 'regDate,DESC');
      setCommentList([...data.comments.content]);
      setCommentCount(data.comments.totalElements);
      setCurrentPage(data.comments.number);
      setIsLastPage(data.comments.last);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const [nextLoading, setNextLoading] = useState<boolean>(false);
  // ????????? ????????? ????????? ???
  const nextCommentList = async () => {
    try {
      setNextLoading(true);
      const { data } = await requestNextCommentList(currentPage, fundIdx, 'regDate,DESC');
      setCommentList([...commentList, ...data.comments.content]);
      setCurrentPage(data.comments.number);
      setIsLastPage(data.comments.last);
      setNextLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const [ref, inView] = useInView();

  // Drawer ?????????

  const [toggled, setToggled] = useState<boolean>(false);
  function handleDrawer() {
    setToggled(!toggled);
    setPaying('');
  }

  // ????????? input ??????

  function handleKeyUp(event: React.KeyboardEvent<HTMLImageElement>) {
    if (event.key === 'Enter') {
      (document.activeElement as HTMLElement).blur();
    }
  }
  useEffect(() => {
    initCommentList();
  }, []);
  useEffect(() => {
    if (inView && !isLastPage) {
      nextCommentList();
    }
  }, [inView]);

  // ????????? ??????
  const userId = useAppSelector((state) => state.userSlice.userId);
  // ??????
  const [money, setMoney] = React.useState(0);

  useEffect(() => {
    requestMoneyInfo();
  }, []);

  /** ?????? ?????? */
  const requestMoneyInfo = async () => {
    try {
      if (userId) {
        const response = await requestUserProfile(userId);
        console.log('?????? ????????? ??????', response);
        setMoney(response.data.money);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ?????? ??????
  const [paying, setPaying] = useState('');

  async function fundingHandler() {
    console.log('?????? ?????? ??????: ', fundIdx, '??? ????????????', paying, '??? ?????? ??????');
    try {
      if (stringToNumber(paying) < 1000) {
        customTextOnlyAlert(noTimeSuccess, `???????????? ????????? 1000????????? ???????????????.`);
        return;
      }
      if (stringToNumber(paying) > Number(money)) {
        customTextOnlyAlert(noTimeSuccess, `??????????????? ???????????????.`);
        return;
      }
      if (stringToNumber(paying) % 100 !== 0) {
        customTextOnlyAlert(noTimeSuccess, `?????? ????????? 100??? ????????? ???????????????.`);
        return;
      }
      await fundingJoin(paying, fundIdx);
      customTextOnlyAlert(noTimeSuccess, `${paying}????????? ????????? ??????????????????!`);
      setToggled(!toggled);
      setPaying('');
      fetchData();
      requestMoneyInfo();
    } catch (error) {
      console.log(error);
    }
  }
  // ??? ??????
  const [value, setValue] = React.useState('one');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  // ????????? ???
  const [report, setReport] = useState<reportInterface>({
    content: '',
    liveUrl: '',
    regDate: '',
    reportDetailResponseList: [
      {
        amount: '',
        description: '',
      },
    ],
  });

  const fetchReportList = async () => {
    try {
      const response = await requestFundingReport(fundIdx);
      console.log('Report res: ', response);
      setReport(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReportList();
  }, []);

  // ????????? ??????
  function calc(tar: string, cur: string) {
    const newTar = Number(tar?.replaceAll(',', ''));
    const newCur = Number(cur?.replaceAll(',', ''));

    return Math.round((newCur / newTar) * 100);
  }

  // ?????? ?????? GET
  const isLogin = useAppSelector((state) => state.userSlice.isLogin);
  const [teamInfo, setTeamInfo] = useState<TeamInfoType>({
    email: '',
    id: 0,
    name: '',
  });
  type TeamInfoType = {
    email: string;
    id: number;
    name: string;
  };
  async function getTeamInfo() {
    const res = await requestTeamAccountInfo();
    setTeamInfo(res.data);
    console.log('?????????', res);
  }
  useEffect(() => {
    if (isLogin && userType === 'TEAM') {
      getTeamInfo();
    }
  }, [userType]);

  // ????????? ??????
  const [CheckRoom, setCheckRoom] = useState<boolean>(false);

  const createSession = async () => {
    try {
      const response = await requestCreateSession(teamInfo.name, Number(fundIdx));
      localStorage.setItem('liveToken', response.data.token);
      navigate(`../publisherLiveRoom/${teamInfo.name}`);
    } catch (e) {
      console.log(e);
    }
  };
  console.log(board);

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>{board.title}</h1>
          <p className={styles.bannerSeen}> ????????? {board.hit}???</p>
          {userType === 'TEAM' && teamInfo.id === board.team.id && (
            <div className={styles.bannerButtonGroup}>
              <button className={styles.bannerGrpBtn} type="button" onClick={() => dispatch(openModal({ isOpen: true, fundingId: fundIdx as string }))}>
                ????????? ??????
              </button>
              <button
                className={styles.bannerGrpBtn}
                type="button"
                onClick={() => {
                  createSession();
                }}
              >
                ????????? ??????
              </button>
              <NavLink to={`/funding/modify/${fundIdx}`} style={{ textDecoration: 'none', margin: '0 3%' }}>
                <button className={styles.bannerGrpBtn} type="button">
                  ?????? ????????????
                </button>
              </NavLink>
            </div>
          )}
        </div>
      </div>
      <div className={styles.mainContainer}>
        <div className={styles.mainSum}>
          {' '}
          <FundSummary {...board} />
        </div>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="primary"
            aria-label="secondary tabs example"
            TabIndicatorProps={{
              sx: { backgroundColor: '#E6750A' },
            }}
            sx={{ height: '50px' }}
          >
            <Tab value="one" label="???????????? ?????? ??????" />
            <Tab value="two" label="???????????? ??????" />
          </Tabs>
        </Box>
        <div className={styles.mainContent}>
          {value === 'one' ? (
            <div className={styles.mainContentInner}>{board.content && <Viewer initialValue={board.content} />}</div>
          ) : (
            <div className={styles.mainContentInner}>
              <p>{report.content}</p>
              <p>{report.regDate}</p>
              <h2>????????? ?????? ?????? ??????</h2>
              <video className={styles.video} controls autoPlay loop>
                <source src={report.liveUrl} type="video/webm" />
                <source src={report.liveUrl} type="video/mp4" />
                <track src="captions_en.vtt" kind="captions" srcLang="kor" label="kor_captions" />
              </video>
              <PdfViewer pdfUrl="" />
              <div className={styles.reslists}>123</div>
            </div>
          )}
        </div>
        <hr style={{ borderTop: '2px solid #bbb', borderRadius: '2px', opacity: '0.5' }} />
        <div className={styles.teamInfoCard} style={{ width: '90%', marginLeft: '6%' }}>
          <TeamInfo {...board.team} />
        </div>
        <hr style={{ borderTop: '2px solid #bbb', borderRadius: '2px', opacity: '0.5' }} />
        <DetailArcodian {...board} />
        <div className={styles.mainCommentSubmit}>
          <p className={styles.commentHead}>?????? ?????? ??????({commentCount})</p>
          <CommentCardSubmit initCommentList={initCommentList} />
        </div>
        <div className={styles.mainComments}>
          {isLoading ? (
            <CommentSkeleton />
          ) : (
            commentList.map((comment, i) => {
              return (
                <CommentCard
                  commentId={comment.commentId}
                  memberNickName={comment.memberNickName}
                  content={comment.content}
                  memberProfileImg={comment.memberProfileImg}
                  regDate={comment.regDate}
                  // eslint-disable-next-line
                  key={i}
                />
              );
            })
          )}
          {nextLoading ? <CircularProgress color="warning" /> : ''}
        </div>
        {currentPage >= 0 ? <div ref={ref} /> : ''}
      </div>
      {isLogin && (userType === 'NORMAL' || userType === 'KAKAO') && (
        <Fab
          aria-label="add"
          sx={{ color: 'white', backgroundColor: 'orange !important', position: 'fixed', bottom: '3%', right: '3%', width: '60px', height: '60px' }}
          onClick={() => handleDrawer()}
          className={styles.fabToggle}
        >
          <LocalAtmIcon />
        </Fab>
      )}

      <Box
        sx={{
          position: 'fixed',
          bottom: '10px',
          left: toggled ? '0px' : '-100%',
          width: '90%',
          height: '13%',
          transition: '1s ease-in-out',
          margin: '0 20px',
        }}
        className={styles.payBox}
      >
        <div className={styles.payBar}>
          <p>
            <span>{board.team.name}</span>?????? ????????? ??? <span>{board.participatedCount}</span>?????? ???????????????
          </p>
          <div>
            <TextField
              label="?????? ??????"
              id="custom-css-outlined-input"
              type="text"
              size="small"
              sx={{ margin: '0 20px', backgroundColor: 'white' }}
              // eslint-disable-next-line
              onKeyUp={handleKeyUp}
              color="warning"
              onChange={(e) => {
                const { value } = e.target;
                console.log('?????? value', value);
                const regex = /[^0-9]/g;
                const separatorValue = stringToSeparator(value.replaceAll(regex, ''));
                setPaying(separatorValue);
              }}
              value={paying}
            />
          </div>

          <p>???????????????</p>
          <button type="button" className={styles.payBtn} onClick={() => fundingHandler()}>
            ?????? ????????????
          </button>
          <div className={styles.mileText}>
            <p>?????? ??????: {stringToSeparator(String(money))}???</p>
            <Link to="/charge" className={styles.milLink}>
              <p className={styles.milea}>???????????? ??????</p>
            </Link>
          </div>
        </div>
      </Box>
      <ReportModal />
    </div>
  );
}
export default FundingDetailContainer;
