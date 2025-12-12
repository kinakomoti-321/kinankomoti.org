import React from "react";

type BoxProps = {
    x?: number;       // 相対座標 (px または %)
    y?: number;
    rotate?: number;
    size?: number;
    center?: boolean; // 中心に置くモード
};

export const Box: React.FC<BoxProps> = ({
    x = 0,
    y = 0,
    rotate = 0,
    size = 80,
    center = false,
}) => {
    return (
        <div
            style={{
                position: "absolute",
                width: size,
                height: size,
                background: "#4f9",
                transform: center
                    ? `translate(-50%, -50%) rotate(${rotate}deg)`
                    : `rotate(${rotate}deg)`,
                left: center ? "50%" : x,
                top: center ? "50%" : y,
                borderRadius: "6px",
            }}
        />
    );
};