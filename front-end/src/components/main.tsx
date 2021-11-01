
import React from 'react';
import '../App.scss';
import OauthLoginButton from './OauthLoginButton';
import { OAUTH_LIST } from '../constants';
import NaverLogin from './naver';
import {useRef} from 'react';

function Main() {
    const button = [useRef(), useRef(), useRef()]

    let i = 0;
    return (
        <div className="App">
            <div>
                <img src="assets/logo.png" alt="" />
            </div>
            <p className="login__title">SELECT Login Button</p>
            {OAUTH_LIST.map((name) => (
                <OauthLoginButton key={name} name={name} button={button[i++]}>
                    {name}
                </OauthLoginButton>
            ))}
            <p className="login__title">
                (C) Attendance starts from the first number{' '}
            </p>
            <NaverLogin button={button[0]}/>
        </div>
    );
}

export default Main;