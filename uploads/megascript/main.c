#include <graphics.h>
#include <conio.h>
#include <math.h>

#define PI 3.14159265

void rotatePoint(int x, int y, int cx, int cy, float angle, int *xNew, int *yNew) {
    float rad = angle * PI / 180.0;
    *xNew = cx + (x - cx) * cos(rad) - (y - cy) * sin(rad);
    *yNew = cy + (x - cx) * sin(rad) + (y - cy) * cos(rad);
}

void drawRotatedBox(int cx, int cy, int size, float angle) {
    int x1, y1, x2, y2, x3, y3, x4, y4;
    int half = size / 2;

    rotatePoint(cx - half, cy - half, cx, cy, angle, &x1, &y1);
    rotatePoint(cx + half, cy - half, cx, cy, angle, &x2, &y2);
    rotatePoint(cx + half, cy + half, cx, cy, angle, &x3, &y3);
    rotatePoint(cx - half, cy + half, cx, cy, angle, &x4, &y4);

    line(x1, y1, x2, y2);
    line(x2, y2, x3, y3);
    line(x3, y3, x4, y4);
    line(x4, y4, x1, y1);
}

int main() {
    int gd = DETECT, gm;
    initgraph(&gd, &gm, "");

    int cx = 300, cy = 200, size = 100;
    float angle = 0;

    while (!kbhit()) {
        cleardevice();
        drawRotatedBox(cx, cy, size, angle);
        angle += 5;  // rotate 5 degrees per frame
        delay(100);
    }

    closegraph();
    return 0;
}
