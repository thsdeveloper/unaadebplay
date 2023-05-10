import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import {getItem} from "../../../services/items";
import {BannerTypes} from "../../../types/BannerTypes";

const BannerDetails = ({ route }) => {
    const { id } = route.params;
    const [banner, setBanner] = useState<BannerTypes>();

    useEffect(() => {
        async function fetchBanner() {
            const bannerData = await getItem('banners', id);
            setBanner(bannerData);
        }

        fetchBanner();
    }, [id]);

    return (
        <View>
            {banner ? (
                <>
                    <Text>{banner.title}</Text>
                </>
            ) : (
                <Text>Loading...</Text>
            )}
        </View>
    );
};

export default BannerDetails;
