import {
    Routes,
    Route,
} from "react-router-dom";
import { Faq } from "./Containers/Faq";
import { Home } from "./Containers/Home";

export const Router: React.FunctionComponent = () => {

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<Faq />} />
        </Routes>
    );
}
