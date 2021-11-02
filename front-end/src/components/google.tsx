import {useState, useEffect, useRef} from 'react';
import GoogleLogin from 'react-google-login';

function GoogleLoginComponent({
    button,
    }: {
    button: any;
    })
{
    const serverUrl = "http://localhost:4000"
    const googleCLientID:string = process.env.REACT_APP_GOOGLE_CLIENTID || '';
    const [user, setUser] = useState({
        email: '',
        profile: '',
        userId: ''
    })
    const googleLog:any = useRef();
    useEffect(()=>{
        button.current.addEventListener('click', ()=>{
            const btnGoogleLogin = googleLog.current.firstChild;
            btnGoogleLogin.click();
        })
    }, []);
    
    const loginSuccess = async (res:any) => {
        const googleUserInfo = {
            email: res.profileObj.email,
            name: res.profileObj.name, 
            'vendor' : 'google'
        }
        let response = await fetch(`${serverUrl}/login`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify(googleUserInfo)
        })
    }

    return (
        <div id='googleIdLogin' ref={googleLog}>
            <GoogleLogin 
                clientId = {googleCLientID}
                buttonText = 'Google'
                onSuccess={result=>loginSuccess(result)}
                onFailure={result=>console.log(result)}
                />
        </div>
    )
}

export default GoogleLoginComponent;