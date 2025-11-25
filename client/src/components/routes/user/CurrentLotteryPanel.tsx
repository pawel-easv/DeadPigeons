export default function CurrentLotteryPanel(){
    return (
        <>
            <div className="flex flex-col bg-light-beige h-[30vh] items-center gap-5 p-3 w-full">
                <h1 className={"text-3xl t"}>
                    Current Lottery
                </h1>
                <h2 className={"text-xl"}>20th Sept 2025 - 27th Sept 2025</h2>
                <h2 className={"text-xl"}>Time till end: 5 Hours 25 Minutes</h2>
                <button className={"btn btn-primary w-[20vw] border-0 bg-green-600 mt-auto mb-auto"}>Join</button>
            </div>
        </>
    )
}