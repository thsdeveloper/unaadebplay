import React from "react";
import {ScrollView} from "native-base";
import {HeaderDrawer} from "@/components/HeaderDrawer";

export default function ModalPage(){
    return (
        <ScrollView>
           <HeaderDrawer children={undefined}  />
        </ScrollView>
    );
};