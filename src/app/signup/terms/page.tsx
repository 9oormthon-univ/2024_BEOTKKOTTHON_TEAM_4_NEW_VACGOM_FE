'use client';
import * as React from 'react';

import { JoinWrap } from './style';

import BackHeader from '@/app/_component/molecule/BackHeader';
import JoinTemplate from '@/app/_component/temp/JoinTemplate';
import BottomButton from '@/app/_component/atom/BottomButton';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useQueryParams } from '@/hooks/useParam';
import TermsDetail from '@/app/_component/molecule/TermsDetail';
import { Suspense, useState } from 'react';
import { OnChangeValueType, ParamsType } from '@/types/globalType';
import { PATH } from '@/routes/path';
import { calculateBirthday, checkParamsFilled } from '@/hooks/useUtil';
import { useAuthKaKao } from '@/api/queries/auth/auth-kakao';
import useKaKaoStore from '@/store/signup/kakaoAgain';
import SkeletonScreen from '@/app/_component/temp/SkeletonScreen';
import WarningToastWrap from '@/app/_component/molecule/WorningToastWrap';
import { useBridge } from '@/bridge/hook/useBridge';

interface Values {
  userName: string;
  birthday: string;
  phoneNo: string;
}

export default function Terms(): React.JSX.Element {
  const router = useRouter();
  const [params, setParams] = useState<ParamsType>({
    nickname: '',
    terms: false,
  });
  const onChangeValue: OnChangeValueType = (field, value) => {
    setParams((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };
  const { goBack } = useBridge();

  const { mutate, isLoading } = useAuthKaKao<Values>();
  const [errormessage, setErrormessage] = useState(''); // 로딩 상태 추가
  const { birthday, phoneNo, userName } = useKaKaoStore((state) => state);
  const handleClick = async () => {
    if (checkParamsFilled(params)) {
      mutate(
        {
          birthday: birthday,
          userName: userName,
          phoneNo: phoneNo,
        },
        {
          onSuccess: () => {},
          onError: (error) => {
            // 에러 처리
            if (error.success === false) {
              // 서버가 핸들링한 에러
              setErrormessage(error.data.message);
              router.push(PATH.SIGNUP_DONE);
            } else {
              // 서버에러
              router.push(PATH.SIGNUP_KAKAO_ERROR);
            }
          },
        },
      );
    }
  };

  if (isLoading) return <SkeletonScreen />;

  return (
    <JoinWrap>
      <BackHeader title={' '} onClickHandler={goBack} />
      <JoinTemplate
        title={'서비스 이용을 위해'}
        useterm={true}
        subTop={'이용약관 동의가 필요해요.'}
        oneLabel={'네, 모두 동의합니다.'}
        params={params}
        field={'terms'}
        onChangeValue={onChangeValue}
      />
      <div className="detail">
        <TermsDetail
          title={'예방접종 도우미 이용약관'}
          content={' '}
          status={params.terms}
        />
      </div>
      <WarningToastWrap
        errorMessage={errormessage}
        setErrorMessage={setErrormessage}
      />
      <BottomButton
        filled={params.terms === true}
        handleNextButtonClick={handleClick}
      />
    </JoinWrap>
  );
}
