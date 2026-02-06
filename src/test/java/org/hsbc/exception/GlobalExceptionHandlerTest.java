package org.hsbc.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testHandleResourceNotFoundException() throws Exception {
        mockMvc.perform(get("/test/resource-not-found")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Resource not found"));
    }

    @Test
    void testHandleInsufficientBalanceException() throws Exception {
        mockMvc.perform(get("/test/insufficient-balance")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Insufficient balance"));
    }

    @Test
    void testHandleInvalidPmsIdException() throws Exception {
        mockMvc.perform(get("/test/invalid-pms-id")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Invalid PMS ID"));
    }

    @Test
    void testHandleInvalidTransactionIdException() throws Exception {
        mockMvc.perform(get("/test/invalid-transaction-id")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Invalid Transaction ID"));
    }

    @Test
    void testHandleGlobalException() throws Exception {
        mockMvc.perform(get("/test/global-exception")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Internal error"));
    }

    @RestController
    static class TestController {
        @GetMapping("/test/resource-not-found")
        public void throwResourceNotFound() {
            throw new ResourceNotFoundException("Resource not found");
        }

        @GetMapping("/test/insufficient-balance")
        public void throwInsufficientBalance() {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        @GetMapping("/test/invalid-pms-id")
        public void throwInvalidPmsId() throws InvalidPmsIdException {
            throw new InvalidPmsIdException("Invalid PMS ID");
        }

        @GetMapping("/test/invalid-transaction-id")
        public void throwInvalidTransactionId() throws InvalidTransactionIdException {
            throw new InvalidTransactionIdException("Invalid Transaction ID");
        }

        @GetMapping("/test/global-exception")
        public void throwGlobalException() throws Exception {
            throw new Exception("Internal error");
        }
    }
}
