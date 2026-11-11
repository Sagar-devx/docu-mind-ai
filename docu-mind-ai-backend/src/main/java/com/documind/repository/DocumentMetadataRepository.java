package com.documind.repository;

import com.documind.dto.DocumentMetadataDto;
import com.documind.entity.DocumentMetaData;
import com.documind.entity.DocumentStatus;
import com.documind.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentMetadataRepository extends JpaRepository<DocumentMetaData, UUID> {

    List<DocumentMetaData> findByStatus(DocumentStatus status);
    List<DocumentMetaData> findByStatusIn(Collection<DocumentStatus> statuses);
    List<DocumentMetaData> findAllByOrderByCreatedAtDesc();
    List<DocumentMetaData> findByUserOrderByCreatedAtDesc(User user);
    Optional<DocumentMetaData> findByIdAndUser(UUID id,User user);
}
