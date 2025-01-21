import { APP_NAME } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

export default function LogoHome() {
    return (
        <div className="flex flex-col gap-2 justify-center items-center text-5xl md:text-6xl font-[family-name:var(--font-fredoka)] min-h-[30vh] md:min-h-[50vh]">
            <FontAwesomeIcon
                icon={faNewspaper}
                className="h-24 w-24 md:h-32 md:w-32 text-logo"
            />
            <div>{APP_NAME}</div>
            <p className="text-xl max-w-sm md:max-w-lg font-[family-name:var(--font-quicksand)]">
                Where the seeds of website knowledge are planted—grow your
                understanding of website elements with Site Sprout.
            </p>
        </div>
    );
}
