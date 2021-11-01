import React, {useEffect, useRef} from 'react';

declare global {
    interface Window {
        naver: any;
    }
}

const { naver } = window;

interface User {
    nickname: string;
    image: string;
}

function NaverLogin({
    button,
    }: {
    button: any;
    }){
    const naverLog:any = useRef(null);

    useEffect(()=>{
        const naverLogin = new naver.LoginWithNaverId({
            clientId: process.env.REACT_APP_NAVER_CLIENTID,
            callbackUrl: process.env.REACT_APP_NAVER_CALLBACKURL,
            callbackHandle: true,
            loginButton: {
                color: 'black',
                type: 1,
                height: 20,
            }
        });
        naverLogin.init();
        button.current.addEventListener('click', ()=>{
            const btnNaverLogin = naverLog.current.firstChild;
            btnNaverLogin.click();
        })
    }, []);
    return (
        <div id='naverIdLogin' ref={naverLog}/>
    )
}

export default NaverLogin;