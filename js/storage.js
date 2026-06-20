export function saveRecord(record){

    const records =
        JSON.parse(
            localStorage.getItem(
                "blinkRecords"
            )
        ) || [];

    records.push(record);

    localStorage.setItem(
        "blinkRecords",
        JSON.stringify(records)
    );

    console.log(
        "saved",
        records.length
    );
}

export function loadRecords(){

    return JSON.parse(
        localStorage.getItem(
            "blinkRecords"
        )
    ) || [];
}

export function clearRecords(){

    localStorage.removeItem(
        "blinkRecords"
    );
}