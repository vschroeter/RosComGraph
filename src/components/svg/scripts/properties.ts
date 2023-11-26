export type orientation = "leftcenter" | "lefttop" | "leftbottom" | "rightcenter" | "righttop" | "rightbottom" | "middletop" | "middlebottom" | "center"

export class Orientation {
    static isLeft = (align: orientation) => align.startsWith("left")
    static isRight = (align: orientation) => align.startsWith("right")
    static isMiddle = (align: orientation) => align.startsWith("middle")
    static isTop = (align: orientation) => align.endsWith("top")
    static isBottom = (align: orientation) => align.endsWith("bottom")
    static isCenter = (align: orientation) => align.endsWith("center")
}


// "topleft" | "topcenter" | "topright" | "middleleft" | "middlecenter" | "middleright" | "bottomleft" | "bottomcenter" | "bottomright" | "center"

