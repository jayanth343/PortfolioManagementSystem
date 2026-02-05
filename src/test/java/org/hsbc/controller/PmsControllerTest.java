package org.hsbc.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hsbc.entity.PmsEntity;
import org.hsbc.service.PmsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PmsController.class)
class PmsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PmsService service;

    @Autowired
    private ObjectMapper objectMapper;

    // 1️⃣ POST /pms/add
    @Test
    void testAddAsset() throws Exception {
        PmsEntity asset = new PmsEntity();
        asset.setId(1L);
        asset.setCompanyName("Apple");
        asset.setQuantity(10);
        asset.setBuyPrice(100);
        asset.setCurrentPrice(120);

        when(service.addAsset(any(PmsEntity.class))).thenReturn(asset);

        mockMvc.perform(post("/pms/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Apple"))
                .andExpect(jsonPath("$.quantity").value(10));
    }

    // 2️⃣ DELETE /pms/remove/{id}
    @Test
    void testRemoveAsset() throws Exception {
        doNothing().when(service).removeAsset(1L);

        mockMvc.perform(delete("/pms/remove/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Asset removed successfully"));
    }

    // 3️⃣ PUT /pms/update-quantity/{id}
    @Test
    void testUpdateQuantity() throws Exception {
        PmsEntity updated = new PmsEntity();
        updated.setId(1L);
        updated.setQuantity(20);

        when(service.updateQuantity(1L, 20)).thenReturn(updated);

        mockMvc.perform(put("/pms/update-quantity/1")
                        .param("quantity", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(20));
    }

    // 4️⃣ GET /pms/pl/{id}
    @Test
    void testGetPL() throws Exception {
        when(service.calculatePL(1L)).thenReturn(200.0);

        mockMvc.perform(get("/pms/pl/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("200.0"));
    }

    // 5️⃣ GET /pms/pl-percentage/{id}
    @Test
    void testGetPLPercentage() throws Exception {
        when(service.calculatePLPercentage(1L)).thenReturn(20.0);

        mockMvc.perform(get("/pms/pl-percentage/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("20.0"));
    }

    // 6️⃣ GET /pms/total-value
    @Test
    void testGetTotalValue() throws Exception {
        when(service.getTotalPortfolioValue()).thenReturn(1200.0);

        mockMvc.perform(get("/pms/total-value"))
                .andExpect(status().isOk())
                .andExpect(content().string("1200.0"));
    }
}
