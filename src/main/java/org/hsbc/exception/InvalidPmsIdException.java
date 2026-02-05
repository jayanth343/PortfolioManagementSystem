package org.hsbc.exception;

public class InvalidPmsIdException extends Exception {

    public InvalidPmsIdException() {
    }

    public InvalidPmsIdException(String message) {
        super(message);
    }

    public InvalidPmsIdException(Throwable cause) {
        super(cause);
    }

    public InvalidPmsIdException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidPmsIdException(String message, Throwable cause, boolean enableSuppression,
                                 boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

}