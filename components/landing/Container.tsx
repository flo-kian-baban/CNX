import React from "react";

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
    id?: string;
}

export default function Container({
    children,
    className = "",
    as: Tag = "div",
    id,
}: ContainerProps) {
    return (
        <Tag id={id} className={`mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-16 ${className}`}>
            {children}
        </Tag>
    );
}
