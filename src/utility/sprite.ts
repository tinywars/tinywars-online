export class Sprite {
    private rotation = 0;

    constructor(private img: CanvasImageSource, private clipX:number, private clipY:number, private clipW:number, private clipH:number) {}

    setRotation(degrees: number) {
        this.rotation = degrees;
    }

    draw(canvas2d: CanvasRenderingContext2D, x: number, y:number, w: number, h: number) {
        //canvas2d.save();
        //canvas2d.rotate(rotation * Math.PI/180);
        // TODO: rotation
        canvas2d.drawImage(this.img, this.clipX, this.clipY, this.clipW, this.clipH, x, y, w, h);
        //canvas2d.restore();
    }
}