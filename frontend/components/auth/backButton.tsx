import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { safeReplace } from '../../helpers/safeNavigation';

type BackButtonProps = {
    path: string;
};

const BackButton: React.FC<BackButtonProps> = ({ path }) => {
    return (
        <Pressable
            className='bg-[#ECECEC] rounded-full w-[42px] h-[42px] justify-center items-center mt-[25px]'
            onPress={() => safeReplace(path)}
        >
            <Ionicons name="chevron-back" size={24} color="#1E1E1E" />
        </Pressable>
    );
};

export default BackButton;