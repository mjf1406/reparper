import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

export default function Logo() {
    return (
        <Link
            href={"/"}
            className="flex gap-2 justify-center items-center text-2xl md:text-3xl font-[family-name:var(--font-fredoka)]"
        >
            <FontAwesomeIcon
                icon={faNewspaper}
                className="h-6 w-6 md:h-10 md:w-10 text-logo"
            />
            <div className="flex flex-col">
                <div>{APP_NAME}</div>
                <div className="text-2xs">
                    <span className="font-bold">Rep</span>ort C
                    <span className="font-bold">ar</span>d Hel
                    <span className="font-bold">per</span> for Younghoon
                    teachers
                </div>
            </div>
        </Link>
    );
}
