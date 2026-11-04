package com.documind.repository;

import com.documind.entity.DocumentMetaData;
import com.documind.entity.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentMetadataRepository extends JpaRepository<DocumentMetaData, UUID> {

    List<DocumentMetaData> findByStatus(DocumentStatus status);
    List<DocumentMetaData> findAllByOrderByCreatedAtDesc();
}
