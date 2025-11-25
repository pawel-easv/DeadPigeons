import LogoImage from '../../../assets/logo.png'

import {useNavigate} from "react-router";
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function TopMenu() {
    const navigate = useNavigate();
    return (
        <div className="flex w-full justify-between items-center px-10 py-5
                bg-dark-beige border-b border-border-gray">

            <div className="btn btn-primary text-xl p-6 flex items-center cursor-pointer bg-cream-red ">
                <img src={LogoImage} alt="logo" className="h-10"/>
                <span>Dead Pigeons</span>
            </div>

            <div className="btn btn-primary bg-cream-red h-14 w-18">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </div>
        </div>
    );
}
