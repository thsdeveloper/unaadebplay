import React, { ReactNode } from 'react';
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetItem,
    ActionsheetItemText,
    ActionsheetIcon,
    ActionsheetScrollView,
    ActionsheetSection,
    ActionsheetSectionText,
    ActionsheetVirtualizedList,
    ActionsheetFlatList,
    ActionsheetSectionHeaderText,
} from "@/components/ui/actionsheet";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { useDisclose } from "@gluestack-ui/hooks";

// Tipo para os itens do menu
export type ActionsheetItemProps = {
    label: string;
    icon?: {
        as: any;
        name: string;
        color?: string;
        size?: "xs" | "sm" | "md" | "lg" | "xl";
    };
    onPress: () => void;
    disabled?: boolean;
    closeOnPress?: boolean;
    testID?: string;
};

// Tipo para as seções
export type ActionsheetSectionProps = {
    title?: string;
    items: ActionsheetItemProps[];
};

// Props para o componente principal
type CustomActionsheetProps = {
    // Props de controle
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    // Conteúdo
    title?: string;
    items?: ActionsheetItemProps[];
    sections?: ActionsheetSectionProps[];
    // Comportamento
    snapPoints?: number[];
    defaultSnapPoint?: number;
    useScrollView?: boolean;
    useFlatList?: boolean;
    useVirtualizedList?: boolean;
    initialFocusRef?: React.RefObject<any>;
    avoidKeyboard?: boolean;
    closeOnOverlayClick?: boolean;
    // Customização
    showDragIndicator?: boolean;
    headerComponent?: ReactNode;
    footerComponent?: ReactNode;
    backdropStyle?: any;
    customContent?: ReactNode;
};

/**
 * Componente comum de Actionsheet para ser reutilizado em toda a aplicação
 */
export const CustomActionsheet = ({
                                      // Props com valores padrão
                                      isOpen: externalIsOpen,
                                      onOpen: externalOnOpen,
                                      onClose: externalOnClose,
                                      title,
                                      items = [],
                                      sections = [],
                                      snapPoints,
                                      defaultSnapPoint,
                                      useScrollView = false,
                                      useFlatList = false,
                                      useVirtualizedList = false,
                                      initialFocusRef,
                                      avoidKeyboard = false,
                                      closeOnOverlayClick = true,
                                      showDragIndicator = true,
                                      headerComponent,
                                      footerComponent,
                                      backdropStyle,
                                      customContent,
                                  }: CustomActionsheetProps) => {
    // Gerenciamento de estado interno ou externo
    const internalDisclose = useDisclose();

    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalDisclose.isOpen;
    const onOpen = externalOnOpen || internalDisclose.onOpen;
    const onClose = externalOnClose || internalDisclose.onClose;

    // Renderizar item individual
    const renderItem = (item: ActionsheetItemProps) => (
        <ActionsheetItem
            key={`item-${item.label}`}
            onPress={() => {
                item.onPress();
                if (item.closeOnPress !== false) {
                    onClose();
                }
            }}
            disabled={item.disabled}
            testID={item.testID}
        >
            {item.icon && (
                <ActionsheetIcon>
                    <Icon
                        as={item.icon.as}
                        name={item.icon.name}
                        size={item.icon.size || "md"}
                        color={item.icon.color}
                    />
                </ActionsheetIcon>
            )}
            <ActionsheetItemText>{item.label}</ActionsheetItemText>
        </ActionsheetItem>
    );

    // Renderizar seção
    const renderSection = (section: ActionsheetSectionProps, index: number) => (
        <ActionsheetSection key={`section-${index}`}>
            {section.title && (
                <ActionsheetSectionHeaderText>{section.title}</ActionsheetSectionHeaderText>
            )}
            {section.items.map(renderItem)}
        </ActionsheetSection>
    );

    // Determinar o conteúdo principal
    const renderContent = () => {
        // Caso o usuário forneça conteúdo personalizado
        if (customContent) {
            return customContent;
        }

        // Componente de lista para renderizar os itens
        const listContent = (
            <>
                {/* Título opcional */}
                {title && (
                    <Box w="100%" px={4} py={3}>
                        <Text fontSize="16" color="$gray500" fontWeight="bold">
                            {title}
                        </Text>
                    </Box>
                )}

                {/* Header personalizado */}
                {headerComponent}

                {/* Itens simples (sem seções) */}
                {items.length > 0 && items.map(renderItem)}

                {/* Seções de itens */}
                {sections.length > 0 && sections.map(renderSection)}

                {/* Footer personalizado */}
                {footerComponent}
            </>
        );

        // Retorna o conteúdo com o tipo de scroll apropriado
        if (useScrollView) {
            return <ActionsheetScrollView>{listContent}</ActionsheetScrollView>;
        } else if (useFlatList) {
            return (
                <ActionsheetFlatList
                    data={items.length > 0 ? items : sections.flatMap(s => s.items)}
                    renderItem={({ item }) => renderItem(item)}
                    keyExtractor={(item) => `flat-${item.label}`}
                />
            );
        } else if (useVirtualizedList) {
            return (
                <ActionsheetVirtualizedList
                    data={items.length > 0 ? items : sections.flatMap(s => s.items)}
                    renderItem={({ item }) => renderItem(item)}
                    keyExtractor={(item) => `virtual-${item.label}`}
                    getItemCount={(data) => data.length}
                    getItem={(data, index) => data[index]}
                />
            );
        }

        // Padrão: sem scroll
        return listContent;
    };

    return (
        <Actionsheet
            isOpen={isOpen}
            onClose={onClose}
            snapPoints={snapPoints}
            defaultSnapPoint={defaultSnapPoint}
            initialFocusRef={initialFocusRef}
            avoidKeyboard={avoidKeyboard}
            closeOnOverlayClick={closeOnOverlayClick}
        >
            <ActionsheetBackdrop {...backdropStyle} />
            <ActionsheetContent>
                {showDragIndicator && (
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>
                )}
                {renderContent()}
            </ActionsheetContent>
        </Actionsheet>
    );
};

// Hook para facilitar o uso do Actionsheet
export const useActionsheet = () => {
    const { isOpen, onOpen, onClose } = useDisclose();
    return { isOpen, onOpen, onClose };
};

// Exportação de componentes individuais para casos especiais
export {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetItem,
    ActionsheetItemText,
    ActionsheetIcon,
    ActionsheetScrollView,
    ActionsheetSection,
    ActionsheetSectionText,
};
