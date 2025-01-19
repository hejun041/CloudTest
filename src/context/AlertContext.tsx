import React from 'react';
import { DropdownAlertType } from 'react-native-dropdownalert';

interface AlertContextType {
    showAlert: (type: DropdownAlertType, title: string, message: string) => void;
}

const AlertContext = React.createContext<AlertContextType | null>(null);

export default AlertContext;
