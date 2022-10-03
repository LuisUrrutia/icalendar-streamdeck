export default class Drawer {
  private canvas: HTMLCanvasElement;
  private backgroundColor = '#000000';
  private headerBackgroundColor = '#7d34eb';

  constructor(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    this.canvas = canvas;
  }

  public draw(title: string, hours: number, minutes: number, seconds: number): string {
    const context = this.canvas.getContext('2d');
    if (context === null) {
      throw new Error('could not create 2d context in canvas');
    }

    // Full background
    context.fillStyle = this.backgroundColor;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Header background
    context.fillStyle = this.backgroundColor;
    context.fillStyle = this.headerBackgroundColor;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.25);

    // Header text
    context.font = 'bold 18px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      this.fittingString(context, title, this.canvas.width * 0.9),
      this.canvas.width / 2,
      this.canvas.height * 0.125,
    );

    // Content text
    context.font = 'bold 36px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      this.formatTime(hours, minutes, seconds),
      this.canvas.width / 2,
      this.canvas.height * 0.375 + this.canvas.height * 0.25,
    );

    return this.canvas.toDataURL('image/png');
  }

  private formatTime(hours: number, minutes: number, seconds: number): string {
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    if (minutes > 0) {
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(seconds).padStart(2, '0')}s`;
  }

  private fittingString(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    const ellipsis = '…';
    const ellipsisWidth = context.measureText(ellipsis).width;
    let width = context.measureText(text).width;
    let newText = text;

    if (width <= maxWidth || width <= ellipsisWidth) {
      return newText;
    } else {
      let length = newText.length;
      while (width >= maxWidth - ellipsisWidth && length-- > 0) {
        newText = text.slice(0, Math.max(0, length));
        width = context.measureText(newText).width;
      }
      return newText + ellipsis;
    }
  }
}
