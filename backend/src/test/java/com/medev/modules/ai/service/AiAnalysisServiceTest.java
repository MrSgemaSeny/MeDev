package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.profile.dto.UpdateProfileRequest;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AiAnalysisServiceTest {

    @Mock
    private GroqClient groqClient;

    private ObjectMapper objectMapper = new ObjectMapper();

    private AiAnalysisService aiAnalysisService;

    @BeforeEach
    void setUp() {
        aiAnalysisService = new AiAnalysisService(groqClient, objectMapper);
    }

    private MockMultipartFile createPdfFile(String text) throws Exception {
        PDDocument doc = new PDDocument();
        PDPage page = new PDPage();
        doc.addPage(page);
        PDPageContentStream cs = new PDPageContentStream(doc, page);
        cs.beginText();
        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
        cs.newLineAtOffset(50, 700);
        cs.showText(text);
        cs.endText();
        cs.close();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        doc.save(baos);
        doc.close();
        return new MockMultipartFile("file", "resume.pdf", "application/pdf", baos.toByteArray());
    }

    @Test
    void parseResumePdf_happyPath() throws Exception {
        MockMultipartFile file = createPdfFile("John Doe - Software Developer");
        String jsonResponse = "{\"fullName\":\"John Doe\",\"headline\":\"Software Developer\"}";
        when(groqClient.sendChatCompletion(anyString(), anyString())).thenReturn(jsonResponse);

        UpdateProfileRequest result = aiAnalysisService.parseResumePdf(file);

        assertThat(result).isNotNull();
        assertThat(result.getFullName()).isEqualTo("John Doe");
        assertThat(result.getHeadline()).isEqualTo("Software Developer");
    }

    @Test
    void parseResumePdf_longText_truncatesTo10000() throws Exception {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 11000; i++) {
            sb.append("A");
        }
        MockMultipartFile file = createPdfFile(sb.toString());
        String jsonResponse = "{}";
        when(groqClient.sendChatCompletion(anyString(), anyString())).thenReturn(jsonResponse);

        aiAnalysisService.parseResumePdf(file);

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(groqClient).sendChatCompletion(anyString(), captor.capture());
        assertThat(captor.getValue().length()).isLessThanOrEqualTo(10000);
    }

    @Test
    void parseResumePdf_groqReturnsInvalidJson_throwsRuntime() throws Exception {
        MockMultipartFile file = createPdfFile("Text");
        when(groqClient.sendChatCompletion(anyString(), anyString())).thenReturn("not json");

        UpdateProfileRequest result = aiAnalysisService.parseResumePdf(file);
        assertThat(result).isNotNull();
        assertThat(result.getFullName()).isNull();
    }

    @Test
    void parseResumePdf_invalidPdf_throwsRuntime() {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "random bytes".getBytes());

        assertThatThrownBy(() -> aiAnalysisService.parseResumePdf(file))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to read PDF file");
    }

    @Test
    void parseResumePdf_groqThrowsException_propagates() throws Exception {
        MockMultipartFile file = createPdfFile("Text");
        when(groqClient.sendChatCompletion(anyString(), anyString())).thenThrow(new RuntimeException("Groq error"));

        assertThatThrownBy(() -> aiAnalysisService.parseResumePdf(file))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Groq error");
    }
}
