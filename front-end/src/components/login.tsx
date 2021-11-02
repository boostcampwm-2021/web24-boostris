import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function Login() {
    const location = useLocation();
    const serverUrl = "http://localhost:4000"
    
    useEffect(()=> {
        const naverLogin = async (accessToken: any) => {
            console.log(accessToken);
            let response = await fetch(`${serverUrl}/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({'accessToken': accessToken, 'vendor' : 'naver'})
            }).then(()=>{console.log(document.cookie)})
        }
        const accessToken = location.hash.split('=')[1].split('&')[0];
        naverLogin(accessToken);
    },[])
    return (
        <div>hello</div>
    )
}
export default Login;