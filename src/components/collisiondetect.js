import hitSound from "../assets/songs/hitsounds/HitSound.ogg";
let initialise = false;
let sound;
const getMat = (direction) => {
    let dict = {
        0: [0, -1],
        1: [0, 1],
        2: [1, 0],
        3: [-1, 0],
        4: [1, -1],
        5: [-1, -1],
        6: [1, 1],
        7: [-1, 1],
        8: [0, 0],
    }
    return dict[direction];
}

const getHitDirection = (cube, balls, prop) => {
    let vec_x = Math.sign(balls[prop].position.x - cube.position.x);
    let vec_y = Math.sign(balls[prop].position.y - cube.position.y);
    let hitMatrix = getMat(cube.userData.direction);
    let correctHit = vec_x * hitMatrix[0] + vec_y * hitMatrix[1];
    if (correctHit > 0) return true;
    else return false;
}

const changeScore = (Hitdirection, colorMatch, score, combo) => {
    let basescore = 10;
    if (!colorMatch) {
        combo = 1;
        sound.play();
        // console.table({score,combo});
        return;
    }
    if (!Hitdirection) {
        basescore /= 2;
    }
    score += basescore * combo;
    if (Hitdirection) {
        combo++;
    }
    sound.play();
    // console.table({score,combo});

}

const handleCollisions = (room, balls, score, combo) => {
    if (initialise == false) {
        initialise = true;
        sound = new Audio(hitSound);
    }
    for (let i = 0; i < room.children.length; i++) {
        if (room.children[i].userData.objectType === "obstacle") {
            const cube = room.children[i];
            for (let prop in balls) {
                let dist;
                if (cube.userData !== null && balls[prop].geometry.boundingSphere !== null) {
                    dist = Math.pow(cube.userData.radius, 2) + Math.pow(balls[prop].userData.radius, 2);
                }
                if (cube.position.distanceToSquared(balls[prop].position) < dist) {
                    console.log('collision');
                    let Hitdirection = getHitDirection(cube, balls, prop);
                    let colorMatch = cube.userData.color == balls[prop].userData.color;
                    changeScore(Hitdirection, colorMatch, score, combo);
                    room.remove(cube);
                }
            }
        }
    }
}

export { handleCollisions }