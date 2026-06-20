const LEFT_EYE = [
    33,
    160,
    158,
    133,
    153,
    144
];

export {
    LEFT_EYE
};

export function distance(a,b){

    return Math.sqrt(
        (a.x-b.x)**2 +
        (a.y-b.y)**2
    );

}

export function calcEAR(points){

    const vertical =
        distance(points[1],points[5]) +
        distance(points[2],points[4]);

    const horizontal =
        2 *
        distance(points[0],points[3]);

    return vertical / horizontal;
}