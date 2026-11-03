package com.documind.service;

import com.documind.dto.DocumentResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentMetadataService {

    DocumentResponseDto uploadandProcess(MultipartFile file);


}
