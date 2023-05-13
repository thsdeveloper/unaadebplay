import React, { useContext } from 'react';
import ConfigContext from "../contexts/ConfigContext";
import {Text} from "native-base";

interface ConfigWrapperProps {
    children: React.ReactNode;
}

export const ConfigWrapper: React.FC<ConfigWrapperProps> = ({ children }) => {
    const { loading } = useContext(ConfigContext);

    if (loading) {
        return (
            <Text>carregando...</Text>
        );
    }

    return <>{children}</>;
};
