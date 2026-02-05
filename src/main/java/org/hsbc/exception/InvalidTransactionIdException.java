package org.hsbc.exception;

public class InvalidTransactionIdException extends Exception {

    public InvalidTransactionIdException() {
    }

    public InvalidTransactionIdException(String message) {
        super(message);
    }

    public InvalidTransactionIdException(Throwable cause) {
        super(cause);
    }

    public InvalidTransactionIdException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidTransactionIdException(String message, Throwable cause, boolean enableSuppression,
                                         boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

}