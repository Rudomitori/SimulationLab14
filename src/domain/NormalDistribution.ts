export function getNormal():number {
    let x = -6
    for(let i = 0; i < 12; i++)
        x += Math.random()
    return x
}

export function getNormalProbability(x:[number, number]):number {
    let p = [0, 0]
    for(let i = 0; i < 2; i++){
        p[i] = Math.exp(-Math.pow((x[i]),2)/2) / Math.sqrt(2 * Math.PI)
    }
    return  (p[1] + p[0])/2*(x[1] - x[0])
}
