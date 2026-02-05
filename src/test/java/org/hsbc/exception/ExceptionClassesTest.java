package org.hsbc.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ExceptionClassesTest {

    @Test
    void testResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
        assertEquals("Not found", ex.getMessage());
    }

    @Test
    void testInsufficientBalanceException() {
        InsufficientBalanceException ex = new InsufficientBalanceException("Low balance");
        assertEquals("Low balance", ex.getMessage());
    }

    @Test
    void testInvalidPmsIdException() {
        InvalidPmsIdException ex1 = new InvalidPmsIdException();
        assertNull(ex1.getMessage());

        InvalidPmsIdException ex2 = new InvalidPmsIdException("Invalid ID");
        assertEquals("Invalid ID", ex2.getMessage());

        Throwable cause = new RuntimeException("Cause");
        InvalidPmsIdException ex3 = new InvalidPmsIdException(cause);
        assertEquals(cause, ex3.getCause());

        InvalidPmsIdException ex4 = new InvalidPmsIdException("Message", cause);
        assertEquals("Message", ex4.getMessage());
        assertEquals(cause, ex4.getCause());

        InvalidPmsIdException ex5 = new InvalidPmsIdException("Message", cause, true, true);
        assertEquals("Message", ex5.getMessage());
    }

    @Test
    void testInvalidTransactionIdException() {
        InvalidTransactionIdException ex1 = new InvalidTransactionIdException();
        assertNull(ex1.getMessage());

        InvalidTransactionIdException ex2 = new InvalidTransactionIdException("Invalid ID");
        assertEquals("Invalid ID", ex2.getMessage());

        Throwable cause = new RuntimeException("Cause");
        InvalidTransactionIdException ex3 = new InvalidTransactionIdException(cause);
        assertEquals(cause, ex3.getCause());

        InvalidTransactionIdException ex4 = new InvalidTransactionIdException("Message", cause);
        assertEquals("Message", ex4.getMessage());
        assertEquals(cause, ex4.getCause());

        InvalidTransactionIdException ex5 = new InvalidTransactionIdException("Message", cause, true, true);
        assertEquals("Message", ex5.getMessage());
    }

    @Test
    void testErrorResponse() {
        ErrorResponse er = new ErrorResponse();
        er.setStatus(404);
        er.setError("Not Found");
        er.setMessage("Missing");
        er.setPath("/api/test");

        assertEquals(404, er.getStatus());
        assertEquals("Not Found", er.getError());
        assertEquals("Missing", er.getMessage());
        assertEquals("/api/test", er.getPath());
        assertNotNull(er.getTimestamp()); // Default constructor sets timestamp now

        ErrorResponse er2 = new ErrorResponse(500, "Error", "Msg", "/path");
        assertEquals(500, er2.getStatus());
    }
}
